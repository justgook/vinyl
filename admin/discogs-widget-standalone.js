/**
 * Standalone Vinyl Record Widget (without DecapCMS)
 * Adapted from the DecapCMS widget to work independently
 * 
 * @see https://www.discogs.com/developers
 */

(function() {
  'use strict';

  const DISCOGS_API_BASE = 'https://api.discogs.com';
  const USER_AGENT = 'VinylCabinet/1.0';
  const CONDITIONS = ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor'];

  /**
   * Standalone Vinyl Record Widget
   */
  class VinylRecordWidget {
    constructor(container, initialRecord, onChange, nextId = null) {
      this.container = container;
      this.onChange = onChange;

      // Initialize state
      this.state = {
        // Search state
        searchTerm: '',
        searchType: 'catno',
        loading: false,
        results: [],
        error: null,
        apiToken: localStorage.getItem('discogs_api_token') || '',
        showTokenInput: !localStorage.getItem('discogs_api_token'),

        // Record data (editable)
        record: initialRecord || {
          id: nextId || '',
          catalogNumber: '',
          recordLabel: '',
          artists: [],
          album: '',
          year: new Date().getFullYear(),
          genre: [],
          format: 'LP, Album',
          condition: 'Near Mint',
          imageUrl: '',
          sides: [
            { name: 'Side A', tracks: [] },
            { name: 'Side B', tracks: [] },
          ],
          externalIds: {},
        },

        // UI state
        showSearch: !initialRecord,
        editMode: !!initialRecord,
      };

      this.render();
    }

    /**
     * Update state and re-render
     */
    setState(updates) {
      // Store which element has focus before re-render
      const activeElement = document.activeElement;
      const activeId = activeElement?.id;
      const activeType = activeElement?.tagName;
      const cursorPosition = activeElement?.selectionStart;

      this.state = { ...this.state, ...updates };
      this.render();

      // Restore focus after re-render
      if (activeId && activeType) {
        const elementToFocus = document.getElementById(activeId);
        if (elementToFocus) {
          elementToFocus.focus();
          if (typeof cursorPosition === 'number') {
            elementToFocus.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
      }

      // Notify parent of record changes
      if (updates.record) {
        this.onChange(this.state.record);
      }
    }

    /**
     * Update a field in the record
     */
    updateField(field, value) {
      const newRecord = { ...this.state.record, [field]: value };
      this.setState({ record: newRecord });
      this.onChange(newRecord);
    }

    /**
     * Update search type without full re-render
     */
    updateSearchType(type) {
      console.log('updateSearchType called with:', type);
      this.state.searchType = type;
      // Update radio button states manually without re-rendering
      const catnoRadio = document.getElementById('widget-radio-catno');
      const queryRadio = document.getElementById('widget-radio-query');
      if (catnoRadio) catnoRadio.checked = type === 'catno';
      if (queryRadio) queryRadio.checked = type === 'query';

      // Update placeholder without re-rendering
      const searchInput = document.getElementById('widget-search-term');
      if (searchInput) {
        searchInput.placeholder = type === 'catno' ? 'Enter catalog number' : 'Enter album or artist name';
      }
    }

    /**
     * Update an array field (add/remove items)
     */
    updateArrayField(field, index, value) {
      const newArray = [...this.state.record[field]];
      if (value === null) {
        newArray.splice(index, 1);
      } else if (index === -1) {
        newArray.push(value);
      } else {
        newArray[index] = value;
      }
      this.updateField(field, newArray);
    }

    /**
     * Update track in a side
     */
    updateTrack(sideIndex, trackIndex, field, value) {
      const newSides = JSON.parse(JSON.stringify(this.state.record.sides));
      if (trackIndex === -1) {
        newSides[sideIndex].tracks.push({ title: '', duration: '0:00' });
      } else if (value === null) {
        newSides[sideIndex].tracks.splice(trackIndex, 1);
      } else {
        newSides[sideIndex].tracks[trackIndex][field] = value;
      }
      this.updateField('sides', newSides);
    }

    /**
     * Search Discogs API
     */
    async searchDiscogs(term, type) {
      console.log('searchDiscogs called with term:', term, 'type:', type);
      if (!this.state.apiToken) {
        this.setState({ error: 'Please enter your Discogs API token first', showTokenInput: true });
        return;
      }

      if (!term.trim()) {
        this.setState({ error: 'Please enter a search term' });
        return;
      }

      this.setState({ loading: true, error: null, results: [] });

      try {
        const params = new URLSearchParams({
          token: this.state.apiToken,
          type: 'release',
          per_page: '10',
        });

        if (type === 'catno') {
          params.append('catno', term);
        } else {
          params.append('q', term);
        }

        const response = await fetch(`${DISCOGS_API_BASE}/database/search?${params}`, {
          headers: { 'User-Agent': USER_AGENT },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Invalid API token. Please check your Discogs token.');
          }
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          this.setState({ results: data.results, loading: false });
        } else {
          this.setState({
            results: [],
            loading: false,
            error: 'No releases found. Try a different search term.'
          });
        }
      } catch (error) {
        console.error('Discogs API Error:', error);
        this.setState({
          loading: false,
          error: error.message || 'Failed to search Discogs. Please try again.'
        });
      }
    }

    /**
     * Fetch detailed release and import data
     */
    async importRelease(resourceUrl) {
      this.setState({ loading: true, error: null });

      try {
        const url = new URL(resourceUrl);
        url.searchParams.append('token', this.state.apiToken);

        const response = await fetch(url.toString(), {
          headers: { 'User-Agent': USER_AGENT },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const release = await response.json();

        // Map Discogs data to our schema (preserve existing ID)
        const importedRecord = {
          id: this.state.record.id || '', // Keep the auto-generated ID
          catalogNumber: release.labels?.[0]?.catno || '',
          recordLabel: release.labels?.[0]?.name || '',
          artists: release.artists?.map(a => a.name.replace(/\s\(\d+\)$/, '')) || [],
          album: release.title || '',
          year: release.year || new Date().getFullYear(),
          genre: release.genres || [],
          format: this.formatFormat(release.formats),
          condition: this.state.record.condition || 'Near Mint',
          imageUrl: release.images?.[0]?.uri || release.thumb || '',
          sides: this.parseSides(release.tracklist),
          externalIds: {
            discogs: release.uri?.replace('https://api.discogs.com/', '') || `release/${release.id}`,
          },
        };

        this.setState({
          record: importedRecord,
          loading: false,
          results: [],
          showSearch: false,
          editMode: true,
        });
        this.onChange(importedRecord);
      } catch (error) {
        console.error('Discogs API Error:', error);
        this.setState({
          loading: false,
          error: 'Failed to fetch release details. Please try again.'
        });
      }
    }

    /**
     * Format the format string
     */
    formatFormat(formats) {
      if (!formats || formats.length === 0) return 'LP, Album';
      const format = formats[0];
      const parts = [format.name];
      if (format.descriptions) {
        parts.push(...format.descriptions);
      }
      return parts.join(', ');
    }

    /**
     * Parse tracklist into sides
     */
    parseSides(tracklist) {
      if (!tracklist || tracklist.length === 0) {
        return [
          { name: 'Side A', tracks: [] },
          { name: 'Side B', tracks: [] },
        ];
      }

      const sides = [];
      let currentSide = null;

      tracklist.forEach(track => {
        if (track.type_ === 'heading' || /^[A-Z]\d*$/.test(track.position)) {
          if (currentSide && currentSide.tracks.length > 0) {
            sides.push(currentSide);
          }
          currentSide = {
            name: track.title || `Side ${track.position}`,
            tracks: [],
          };
        } else if (track.type_ === 'track') {
          if (!currentSide) {
            currentSide = { name: 'Side A', tracks: [] };
          }
          currentSide.tracks.push({
            title: track.title,
            duration: track.duration || '0:00',
          });
        }
      });

      if (currentSide && currentSide.tracks.length > 0) {
        sides.push(currentSide);
      }

      if (sides.length === 0) {
        const tracks = tracklist
          .filter(t => t.type_ === 'track')
          .map(t => ({ title: t.title, duration: t.duration || '0:00' }));

        const midpoint = Math.ceil(tracks.length / 2);
        return [
          { name: 'Side A', tracks: tracks.slice(0, midpoint) },
          { name: 'Side B', tracks: tracks.slice(midpoint) },
        ];
      }

      return sides;
    }

    /**
     * Save/update API token
     */
    saveToken() {
      if (this.state.apiToken.trim()) {
        localStorage.setItem('discogs_api_token', this.state.apiToken);
        this.setState({ showTokenInput: false, error: null });
      }
    }

    /**
     * Clear API token
     */
    clearToken() {
      localStorage.removeItem('discogs_api_token');
      this.setState({ apiToken: '', showTokenInput: true });
    }

    /**
     * Toggle between search and edit views
     */
    toggleView() {
      this.setState({ showSearch: !this.state.showSearch });
    }

    /**
     * Create element helper
     */
    el(tag, attrs = {}, children = []) {
      const element = document.createElement(tag);
      
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.assign(element.style, value);
        } else if (key === 'className') {
          element.className = value;
        } else if (key.startsWith('on') && typeof value === 'function') {
          element.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'disabled' || key === 'checked') {
          // Handle boolean attributes properly
          if (value) {
            element.setAttribute(key, '');
          }
        } else {
          element.setAttribute(key, value);
        }
      });

      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child) {
          element.appendChild(child);
        }
      });

      return element;
    }

    /**
     * Render the widget
     */
    render() {
      this.container.innerHTML = '';

      const styles = {
        container: {
          border: '3px solid #000',
          padding: '20px',
          backgroundColor: '#fff',
        },
        header: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: '3px solid #000',
        },
        button: {
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 'bold',
          backgroundColor: '#000',
          color: '#FFFF00',
          border: '3px solid #000',
          cursor: 'pointer',
          marginRight: '8px',
        },
        buttonSecondary: {
          padding: '8px 16px',
          fontSize: '13px',
          backgroundColor: '#FF10F0',
          color: '#FFF',
          border: '3px solid #000',
          cursor: 'pointer',
        },
        input: {
          width: '100%',
          padding: '10px',
          fontSize: '14px',
          border: '3px solid #000',
          marginTop: '5px',
        },
        label: {
          fontWeight: 'bold',
          marginBottom: '5px',
          display: 'block',
        },
        fieldGroup: {
          marginBottom: '20px',
        },
        section: {
          backgroundColor: '#f8f9fa',
          padding: '15px',
          marginBottom: '15px',
          border: '2px solid #000',
        },
      };

      const container = this.el('div', { style: styles.container }, [
        this.renderHeader(styles),
        this.state.showSearch ? this.renderSearchView(styles) : this.renderEditView(styles),
      ]);

      this.container.appendChild(container);
    }

    /**
     * Render header
     */
    renderHeader(styles) {
      return this.el('div', { style: styles.header }, [
        this.el('h3', { style: { margin: 0 } }, [
          this.state.showSearch ? '🔍 Search Discogs' : '✏️ Edit Record'
        ]),
        this.el('button', {
          type: 'button',
          onClick: () => this.toggleView(),
          style: styles.buttonSecondary,
        }, [this.state.showSearch ? 'Show Editor' : 'Search Discogs']),
      ]);
    }

    /**
     * Render search view
     */
    renderSearchView(styles) {
      const container = this.el('div', {});

      // API Token Section
      if (this.state.showTokenInput) {
        container.appendChild(this.el('div', { style: styles.fieldGroup }, [
          this.el('label', { style: styles.label }, ['Discogs API Token:']),
          this.el('input', {
            id: 'widget-api-token',
            type: 'password',
            value: this.state.apiToken,
            placeholder: 'Enter your Discogs API token',
            style: styles.input,
            onInput: (e) => {
              this.state.apiToken = e.target.value;
            },
          }),
          this.el('div', { style: { marginTop: '10px' } }, [
            this.el('button', {
              type: 'button',
              onClick: () => this.saveToken(),
              style: styles.button,
            }, ['Save Token']),
            this.el('a', {
              href: 'https://www.discogs.com/settings/developers',
              target: '_blank',
              rel: 'noopener noreferrer',
              style: { marginLeft: '12px' },
            }, ['Get API Token']),
          ]),
        ]));
      } else {
        container.appendChild(this.el('div', { style: styles.fieldGroup }, [
          this.el('span', { style: { color: '#28a745', fontWeight: 'bold' } }, ['✓ API Token configured']),
          this.el('button', {
            type: 'button',
            onClick: () => this.clearToken(),
            style: { ...styles.buttonSecondary, marginLeft: '12px' },
          }, ['Clear Token']),
        ]));
      }

      // Search Form
      const searchForm = this.el('div', { style: styles.fieldGroup }, [
        this.el('div', { style: { marginBottom: '10px' } }, [
          this.el('label', {}, [
            this.el('input', {
              id: 'widget-radio-catno',
              type: 'radio',
              name: 'searchType',
              value: 'catno',
              checked: this.state.searchType === 'catno',
              onChange: () => this.updateSearchType('catno'),
            }),
            ' Catalog Number',
          ]),
          this.el('label', { style: { marginLeft: '20px' } }, [
            this.el('input', {
              id: 'widget-radio-query',
              type: 'radio',
              name: 'searchType',
              value: 'query',
              checked: this.state.searchType === 'query',
              onChange: () => this.updateSearchType('query'),
            }),
            ' Album/Artist',
          ]),
        ]),
        this.el('input', {
          id: 'widget-search-term',
          type: 'text',
          value: this.state.searchTerm,
          placeholder: this.state.searchType === 'catno' ? 'Enter catalog number' : 'Enter album or artist name',
          style: styles.input,
          onInput: (e) => {
            this.state.searchTerm = e.target.value;
          },
          onKeyPress: (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.searchDiscogs(this.state.searchTerm, this.state.searchType);
            }
          },
        }),
        this.el('button', {
          type: 'button',
          disabled: this.state.loading,
          onClick: () => {
            console.log('Search button clicked!', 'searchTerm:', this.state.searchTerm, 'searchType:', this.state.searchType);
            this.searchDiscogs(this.state.searchTerm, this.state.searchType);
          },
          style: { ...styles.button, marginTop: '10px' },
        }, [this.state.loading ? 'Searching...' : '🔍 Search aaa']),
      ]);
      container.appendChild(searchForm);

      // Error Message
      if (this.state.error) {
        container.appendChild(this.el('div', {
          style: {
            color: '#d9534f',
            padding: '12px',
            marginBottom: '12px',
            backgroundColor: '#f8d7da',
            border: '2px solid #000',
          },
        }, [this.state.error]));
      }

      // Loading
      if (this.state.loading) {
        container.appendChild(this.el('div', {
          style: { textAlign: 'center', padding: '20px' },
        }, ['Searching Discogs...']));
      }

      // Results
      if (this.state.results.length > 0) {
        const resultsContainer = this.el('div', { style: styles.section }, [
          this.el('h4', {}, [`Found ${this.state.results.length} release(s) - Click to import:`]),
        ]);

        this.state.results.forEach(result => {
          const resultCard = this.el('div', {
            style: {
              display: 'flex',
              padding: '12px',
              marginBottom: '10px',
              border: '3px solid #000',
              backgroundColor: '#fff',
              cursor: 'pointer',
            },
            onClick: () => this.importRelease(result.resource_url),
          }, []);

          if (result.thumb) {
            resultCard.appendChild(this.el('img', {
              src: result.thumb,
              alt: result.title,
              style: {
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                marginRight: '15px',
                border: '2px solid #000',
              },
            }));
          }

          const info = this.el('div', {}, [
            this.el('div', { style: { fontWeight: 'bold', marginBottom: '5px' } }, [result.title]),
            this.el('div', { style: { fontSize: '13px', color: '#666' } }, [
              [
                result.year && `${result.year}`,
                result.label?.join(', '),
                result.catno && result.catno,
              ].filter(Boolean).join(' · '),
            ]),
          ]);
          resultCard.appendChild(info);

          resultsContainer.appendChild(resultCard);
        });

        container.appendChild(resultsContainer);
      }

      return container;
    }

    /**
     * Render edit view
     */
    renderEditView(styles) {
      const { record } = this.state;
      const container = this.el('div', {});

      // ID and Condition (Required fields)
      const requiredSection = this.el('div', { style: { ...styles.section, backgroundColor: '#fff3cd' } }, [
        this.el('h4', { style: { marginTop: 0 } }, ['📝 Required Fields']),
        this.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } }, [
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Record ID *']),
            this.el('input', {
              id: 'widget-field-id',
              type: 'text',
              value: record.id,
              placeholder: '001, 002, 021...',
              style: { ...styles.input, backgroundColor: '#f0f0f0', cursor: 'not-allowed' },
              pattern: '\\d{3}',
              disabled: true,
            }),
            this.el('small', {}, ['Auto-generated unique 3-digit ID']),
          ]),
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Condition *']),
            this.el('select', {
              id: 'widget-field-condition',
              value: record.condition,
              style: styles.input,
              onChange: (e) => this.updateField('condition', e.target.value),
            }, CONDITIONS.map(cond => this.el('option', { value: cond }, [cond]))),
          ]),
        ]),
      ]);
      container.appendChild(requiredSection);

      // Basic Info
      const basicSection = this.el('div', { style: styles.section }, [
        this.el('h4', { style: { marginTop: 0 } }, ['📀 Basic Information']),
        this.el('div', { style: styles.fieldGroup }, [
          this.el('label', { style: styles.label }, ['Album Title']),
          this.el('input', {
            id: 'widget-field-album',
            type: 'text',
            value: record.album,
            style: styles.input,
            onInput: (e) => this.updateField('album', e.target.value),
          }),
        ]),
        this.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } }, [
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Catalog Number']),
            this.el('input', {
              id: 'widget-field-catalogNumber',
              type: 'text',
              value: record.catalogNumber,
              style: styles.input,
              onInput: (e) => this.updateField('catalogNumber', e.target.value),
            }),
          ]),
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Record Label']),
            this.el('input', {
              id: 'widget-field-recordLabel',
              type: 'text',
              value: record.recordLabel,
              style: styles.input,
              onInput: (e) => this.updateField('recordLabel', e.target.value),
            }),
          ]),
        ]),
        this.el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' } }, [
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Year']),
            this.el('input', {
              id: 'widget-field-year',
              type: 'number',
              value: record.year,
              style: styles.input,
              onInput: (e) => this.updateField('year', parseInt(e.target.value) || ''),
            }),
          ]),
          this.el('div', {}, [
            this.el('label', { style: styles.label }, ['Format']),
            this.el('input', {
              id: 'widget-field-format',
              type: 'text',
              value: record.format,
              style: styles.input,
              onInput: (e) => this.updateField('format', e.target.value),
            }),
          ]),
        ]),
        this.el('div', { style: { ...styles.fieldGroup, marginTop: '15px' } }, [
          this.el('label', { style: styles.label }, ['Cover Image URL']),
          this.el('input', {
            id: 'widget-field-imageUrl',
            type: 'text',
            value: record.imageUrl,
            style: styles.input,
            onInput: (e) => this.updateField('imageUrl', e.target.value),
          }),
          record.imageUrl ? this.el('img', {
            src: record.imageUrl,
            alt: 'Cover preview',
            style: {
              maxWidth: '200px',
              marginTop: '10px',
              border: '3px solid #000',
            },
          }) : null,
        ].filter(Boolean)),
      ]);
      container.appendChild(basicSection);

      // Artists
      const artistsSection = this.el('div', { style: styles.section }, [
        this.el('h4', { style: { marginTop: 0 } }, ['🎤 Artists']),
      ]);
      record.artists.forEach((artist, i) => {
        artistsSection.appendChild(
          this.el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } }, [
            this.el('input', {
              id: `widget-field-artist-${i}`,
              type: 'text',
              value: artist,
              style: { ...styles.input, marginTop: 0, flex: 1 },
              onInput: (e) => this.updateArrayField('artists', i, e.target.value),
            }),
            this.el('button', {
              type: 'button',
              onClick: () => this.updateArrayField('artists', i, null),
              style: {
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: '2px solid #000',
                cursor: 'pointer',
              },
            }, ['✕']),
          ])
        );
      });
      artistsSection.appendChild(
        this.el('button', {
          type: 'button',
          onClick: () => this.updateArrayField('artists', -1, ''),
          style: {
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: '3px solid #000',
            cursor: 'pointer',
            fontWeight: 'bold',
          },
        }, ['+ Add Artist'])
      );
      container.appendChild(artistsSection);

      // Genres
      const genresSection = this.el('div', { style: styles.section }, [
        this.el('h4', { style: { marginTop: 0 } }, ['🎵 Genres']),
      ]);
      record.genre.forEach((genre, i) => {
        genresSection.appendChild(
          this.el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } }, [
            this.el('input', {
              id: `widget-field-genre-${i}`,
              type: 'text',
              value: genre,
              style: { ...styles.input, marginTop: 0, flex: 1 },
              onInput: (e) => this.updateArrayField('genre', i, e.target.value),
            }),
            this.el('button', {
              type: 'button',
              onClick: () => this.updateArrayField('genre', i, null),
              style: {
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: '2px solid #000',
                cursor: 'pointer',
              },
            }, ['✕']),
          ])
        );
      });
      genresSection.appendChild(
        this.el('button', {
          type: 'button',
          onClick: () => this.updateArrayField('genre', -1, ''),
          style: {
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: '3px solid #000',
            cursor: 'pointer',
            fontWeight: 'bold',
          },
        }, ['+ Add Genre'])
      );
      container.appendChild(genresSection);

      // Tracklist
      const tracklistSection = this.el('div', { style: styles.section }, [
        this.el('h4', { style: { marginTop: 0 } }, ['💿 Tracklist']),
      ]);

      record.sides.forEach((side, sideIdx) => {
        const sideContainer = this.el('div', { style: { marginBottom: '20px' } }, [
          this.el('h5', {}, [side.name]),
        ]);

        side.tracks.forEach((track, trackIdx) => {
          sideContainer.appendChild(
            this.el('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' } }, [
              this.el('span', { style: { minWidth: '30px' } }, [`${trackIdx + 1}.`]),
              this.el('input', {
                id: `widget-field-track-${sideIdx}-${trackIdx}-title`,
                type: 'text',
                value: track.title,
                placeholder: 'Track title',
                style: { ...styles.input, marginTop: 0, flex: 2 },
                onInput: (e) => this.updateTrack(sideIdx, trackIdx, 'title', e.target.value),
              }),
              this.el('input', {
                id: `widget-field-track-${sideIdx}-${trackIdx}-duration`,
                type: 'text',
                value: track.duration,
                placeholder: '0:00',
                style: { ...styles.input, marginTop: 0, width: '80px' },
                onInput: (e) => this.updateTrack(sideIdx, trackIdx, 'duration', e.target.value),
              }),
              this.el('button', {
                type: 'button',
                onClick: () => this.updateTrack(sideIdx, trackIdx, null, null),
                style: {
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: '2px solid #000',
                  cursor: 'pointer',
                },
              }, ['✕']),
            ])
          );
        });

        sideContainer.appendChild(
          this.el('button', {
            type: 'button',
            onClick: () => this.updateTrack(sideIdx, -1),
            style: {
              padding: '6px 12px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: '3px solid #000',
              cursor: 'pointer',
              fontSize: '12px',
            },
          }, [`+ Add Track to ${side.name}`])
        );

        tracklistSection.appendChild(sideContainer);
      });

      container.appendChild(tracklistSection);

      // Summary
      const summarySection = this.el('div', { style: { ...styles.section, backgroundColor: '#d4edda' } }, [
        this.el('h4', { style: { marginTop: 0 } }, ['✅ Ready to Save']),
        this.el('p', {}, [`Album: ${record.album || '(not set)'}`]),
        this.el('p', {}, [`ID: ${record.id || '⚠ REQUIRED'}`]),
        this.el('p', {}, [`Artists: ${record.artists.join(', ') || '(none)'}`]),
        this.el('p', {}, [`Tracks: ${record.sides.reduce((sum, s) => sum + s.tracks.length, 0)}`]),
      ]);
      container.appendChild(summarySection);

      return container;
    }
  }

  // Export to window
  window.VinylRecordWidget = VinylRecordWidget;
})();
