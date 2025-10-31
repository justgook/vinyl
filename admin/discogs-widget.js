/**
 * DecapCMS Complete Vinyl Record Widget
 * All-in-one widget for searching Discogs and editing all record fields
 * 
 * @see https://www.discogs.com/developers
 */

(function () {
  'use strict';

  const DISCOGS_API_BASE = 'https://api.discogs.com';
  const USER_AGENT = 'VinylCabinet/1.0';
  const CONDITIONS = ['Mint', 'Near Mint', 'Very Good Plus', 'Very Good', 'Good Plus', 'Good', 'Fair', 'Poor'];

  /**
   * Complete Vinyl Record Widget
   */
  const VinylRecordControl = window.createClass({
    getInitialState() {
      // Try to parse existing value
      const existingValue = this.props.value;
      let recordData = null;
      
      if (existingValue) {
        try {
          recordData = typeof existingValue === 'string' ? JSON.parse(existingValue) : existingValue;
        } catch (e) {
          console.error('Failed to parse existing value:', e);
        }
      }

      return {
        // Search state
        searchTerm: '',
        searchType: 'catno',
        loading: false,
        results: [],
        error: null,
        apiToken: localStorage.getItem('discogs_api_token') || '',
        showTokenInput: !localStorage.getItem('discogs_api_token'),
        
        // Record data (editable)
        record: recordData || {
          id: '',
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
        showSearch: !recordData, // Show search if no existing data
        editMode: !!recordData, // Edit mode if we have data
      };
    },

    componentDidUpdate(prevProps, prevState) {
      // Update parent when record changes
      if (JSON.stringify(prevState.record) !== JSON.stringify(this.state.record)) {
        // Pass the object directly to DecapCMS (not JSON string)
        this.props.onChange(this.state.record);
      }
    },

    /**
     * Update a field in the record
     */
    updateField(field, value) {
      this.setState({
        record: {
          ...this.state.record,
          [field]: value,
        },
      });
    },

    /**
     * Update an array field (add/remove items)
     */
    updateArrayField(field, index, value) {
      const newArray = [...this.state.record[field]];
      if (value === null) {
        // Remove item
        newArray.splice(index, 1);
      } else if (index === -1) {
        // Add new item
        newArray.push(value);
      } else {
        // Update existing item
        newArray[index] = value;
      }
      this.updateField(field, newArray);
    },

    /**
     * Update track in a side
     */
    updateTrack(sideIndex, trackIndex, field, value) {
      const newSides = JSON.parse(JSON.stringify(this.state.record.sides));
      if (trackIndex === -1) {
        // Add new track
        newSides[sideIndex].tracks.push({ title: '', duration: '0:00' });
      } else if (value === null) {
        // Remove track
        newSides[sideIndex].tracks.splice(trackIndex, 1);
      } else {
        // Update track field
        newSides[sideIndex].tracks[trackIndex][field] = value;
      }
      this.updateField('sides', newSides);
    },

    /**
     * Search Discogs API
     */
    async searchDiscogs(term, type) {
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
    },

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
        
        // Map Discogs data to our schema
        const importedRecord = {
          id: this.state.record.id || '', // Keep existing ID
          catalogNumber: release.labels?.[0]?.catno || '',
          recordLabel: release.labels?.[0]?.name || '',
          artists: release.artists?.map(a => a.name.replace(/\s\(\d+\)$/, '')) || [],
          album: release.title || '',
          year: release.year || new Date().getFullYear(),
          genre: release.genres || [],
          format: this.formatFormat(release.formats),
          condition: this.state.record.condition || 'Near Mint', // Keep existing or default
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
      } catch (error) {
        console.error('Discogs API Error:', error);
        this.setState({ 
          loading: false, 
          error: 'Failed to fetch release details. Please try again.' 
        });
      }
    },

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
    },

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
    },

    /**
     * Save/update API token
     */
    saveToken() {
      if (this.state.apiToken.trim()) {
        localStorage.setItem('discogs_api_token', this.state.apiToken);
        this.setState({ showTokenInput: false, error: null });
      }
    },

    /**
     * Clear API token
     */
    clearToken() {
      localStorage.removeItem('discogs_api_token');
      this.setState({ apiToken: '', showTokenInput: true });
    },

    /**
     * Toggle between search and edit views
     */
    toggleView() {
      this.setState({ showSearch: !this.state.showSearch });
    },

    /**
     * Render the widget
     */
    render() {
      const { forID, classNameWrapper } = this.props;
      // eslint-disable-next-line no-unused-vars
      const { loading, results, error, showTokenInput, apiToken, showSearch, record } = this.state;

      const styles = {
        container: {
          border: '3px solid #000',
          padding: '20px',
          backgroundColor: '#fff',
          marginBottom: '20px',
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
        arrayItem: {
          display: 'flex',
          gap: '8px',
          marginBottom: '8px',
          alignItems: 'center',
        },
        removeButton: {
          padding: '5px 10px',
          backgroundColor: '#dc3545',
          color: '#fff',
          border: '2px solid #000',
          cursor: 'pointer',
          fontSize: '12px',
        },
        addButton: {
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: '3px solid #000',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 'bold',
        },
        section: {
          backgroundColor: '#f8f9fa',
          padding: '15px',
          marginBottom: '15px',
          border: '2px solid #000',
        },
      };

      return window.h(
        'div',
        { className: `${classNameWrapper} vinyl-record-widget`, id: forID },
        [
          // Header with toggle
          window.h('div', { style: styles.header, key: 'header' }, [
            window.h('h3', { style: { margin: 0 } }, 
              showSearch ? '🔍 Search Discogs' : '✏️ Edit Record'
            ),
            window.h('button', {
              type: 'button',
              onClick: () => this.toggleView(),
              style: styles.buttonSecondary,
            }, showSearch ? 'Show Editor' : 'Search Discogs'),
          ]),

          // Search View
          showSearch && this.renderSearchView(styles),

          // Edit View
          !showSearch && this.renderEditView(styles),
        ]
      );
    },

    /**
     * Render search view
     */
    renderSearchView(styles) {
      const { loading, results, error, showTokenInput, apiToken } = this.state;

      return window.h('div', { key: 'search-view' }, [
        // API Token Section
        window.h('div', { style: styles.fieldGroup }, [
          showTokenInput
            ? window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Discogs API Token:'),
              window.h('input', {
                type: 'password',
                value: apiToken,
                onChange: e => this.setState({ apiToken: e.target.value }),
                placeholder: 'Enter your Discogs API token',
                style: styles.input,
              }),
              window.h('div', { style: { marginTop: '10px' } }, [
                window.h('button', {
                  type: 'button',
                  onClick: () => this.saveToken(),
                  style: styles.button,
                }, 'Save Token'),
                window.h('a', {
                  href: 'https://www.discogs.com/settings/developers',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  style: { marginLeft: '12px' },
                }, 'Get API Token'),
              ]),
            ])
            : window.h('div', {}, [
              window.h('span', { style: { color: '#28a745', fontWeight: 'bold' } }, '✓ API Token configured'),
              window.h('button', {
                type: 'button',
                onClick: () => this.clearToken(),
                style: { ...styles.buttonSecondary, marginLeft: '12px' },
              }, 'Clear Token'),
            ]),
        ]),

        // Search Form
        window.h('div', { style: styles.fieldGroup }, [
          window.h('div', { style: { marginBottom: '10px' } }, [
            window.h('label', {}, [
              window.h('input', {
                type: 'radio',
                name: 'searchType',
                value: 'catno',
                checked: this.state.searchType === 'catno',
                onChange: () => this.setState({ searchType: 'catno' }),
              }),
              ' Catalog Number',
            ]),
            window.h('label', { style: { marginLeft: '20px' } }, [
              window.h('input', {
                type: 'radio',
                name: 'searchType',
                value: 'query',
                checked: this.state.searchType === 'query',
                onChange: () => this.setState({ searchType: 'query' }),
              }),
              ' Album/Artist',
            ]),
          ]),
          window.h('input', {
            type: 'text',
            value: this.state.searchTerm,
            onChange: e => this.setState({ searchTerm: e.target.value }),
            placeholder: this.state.searchType === 'catno' 
              ? 'Enter catalog number' 
              : 'Enter album or artist name',
            style: styles.input,
            onKeyPress: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.searchDiscogs(this.state.searchTerm, this.state.searchType);
              }
            },
          }),
          window.h('button', {
            type: 'button',
            disabled: loading,
            onClick: () => this.searchDiscogs(this.state.searchTerm, this.state.searchType),
            style: { ...styles.button, marginTop: '10px' },
          }, loading ? 'Searching...' : '🔍 Search'),
        ]),

        // Error Message
        error && window.h('div', { 
          style: { 
            color: '#d9534f', 
            padding: '12px', 
            marginBottom: '12px',
            backgroundColor: '#f8d7da',
            border: '2px solid #000',
          },
        }, error),

        // Loading
        loading && window.h('div', { 
          style: { textAlign: 'center', padding: '20px' } 
        }, 'Searching Discogs...'),

        // Results
        results.length > 0 && window.h('div', { style: styles.section }, [
          window.h('h4', {}, `Found ${results.length} release(s) - Click to import:`),
          ...results.map((result) =>
            window.h('div', {
              key: result.id,
              style: {
                display: 'flex',
                padding: '12px',
                marginBottom: '10px',
                border: '3px solid #000',
                backgroundColor: '#fff',
                cursor: 'pointer',
              },
              onClick: () => this.importRelease(result.resource_url),
            }, [
              result.thumb && window.h('img', {
                src: result.thumb,
                alt: result.title,
                style: { 
                  width: '80px', 
                  height: '80px', 
                  objectFit: 'cover',
                  marginRight: '15px',
                  border: '2px solid #000',
                },
              }),
              window.h('div', {}, [
                window.h('div', { style: { fontWeight: 'bold', marginBottom: '5px' } }, result.title),
                window.h('div', { style: { fontSize: '13px', color: '#666' } }, [
                  result.year && `${result.year} · `,
                  result.label?.join(', '),
                  result.catno && ` · ${result.catno}`,
                ].filter(Boolean).join('')),
              ]),
            ])
          ),
        ]),
      ]);
    },

    /**
     * Render edit view
     */
    renderEditView(styles) {
      const { record } = this.state;

      return window.h('div', { key: 'edit-view' }, [
        // ID and Condition (Required manual fields)
        window.h('div', { style: { ...styles.section, backgroundColor: '#fff3cd' } }, [
          window.h('h4', { style: { marginTop: 0 } }, '📝 Required Fields'),
          window.h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } }, [
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Record ID *'),
              window.h('input', {
                type: 'text',
                value: record.id,
                onChange: e => this.updateField('id', e.target.value),
                placeholder: '001, 002, 021...',
                style: styles.input,
                pattern: '\\d{3}',
              }),
              window.h('small', {}, 'Unique 3-digit ID'),
            ]),
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Condition *'),
              window.h('select', {
                value: record.condition,
                onChange: e => this.updateField('condition', e.target.value),
                style: styles.input,
              }, CONDITIONS.map(cond => 
                window.h('option', { key: cond, value: cond }, cond)
              )),
            ]),
          ]),
        ]),

        // Basic Info
        window.h('div', { style: styles.section }, [
          window.h('h4', { style: { marginTop: 0 } }, '📀 Basic Information'),
          window.h('div', { style: styles.fieldGroup }, [
            window.h('label', { style: styles.label }, 'Album Title'),
            window.h('input', {
              type: 'text',
              value: record.album,
              onChange: e => this.updateField('album', e.target.value),
              style: styles.input,
            }),
          ]),
          window.h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' } }, [
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Catalog Number'),
              window.h('input', {
                type: 'text',
                value: record.catalogNumber,
                onChange: e => this.updateField('catalogNumber', e.target.value),
                style: styles.input,
              }),
            ]),
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Record Label'),
              window.h('input', {
                type: 'text',
                value: record.recordLabel,
                onChange: e => this.updateField('recordLabel', e.target.value),
                style: styles.input,
              }),
            ]),
          ]),
          window.h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' } }, [
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Year'),
              window.h('input', {
                type: 'number',
                value: record.year,
                onChange: e => this.updateField('year', parseInt(e.target.value) || ''),
                style: styles.input,
              }),
            ]),
            window.h('div', {}, [
              window.h('label', { style: styles.label }, 'Format'),
              window.h('input', {
                type: 'text',
                value: record.format,
                onChange: e => this.updateField('format', e.target.value),
                style: styles.input,
              }),
            ]),
          ]),
          window.h('div', { style: { ...styles.fieldGroup, marginTop: '15px' } }, [
            window.h('label', { style: styles.label }, 'Cover Image URL'),
            window.h('input', {
              type: 'text',
              value: record.imageUrl,
              onChange: e => this.updateField('imageUrl', e.target.value),
              style: styles.input,
            }),
            record.imageUrl && window.h('img', {
              src: record.imageUrl,
              alt: 'Cover preview',
              style: { 
                maxWidth: '200px', 
                marginTop: '10px', 
                border: '3px solid #000',
              },
            }),
          ]),
        ]),

        // Artists
        window.h('div', { style: styles.section }, [
          window.h('h4', { style: { marginTop: 0 } }, '🎤 Artists'),
          ...record.artists.map((artist, i) =>
            window.h('div', { key: i, style: styles.arrayItem }, [
              window.h('input', {
                type: 'text',
                value: artist,
                onChange: e => this.updateArrayField('artists', i, e.target.value),
                style: { ...styles.input, marginTop: 0 },
              }),
              window.h('button', {
                type: 'button',
                onClick: () => this.updateArrayField('artists', i, null),
                style: styles.removeButton,
              }, '✕'),
            ])
          ),
          window.h('button', {
            type: 'button',
            onClick: () => this.updateArrayField('artists', -1, ''),
            style: styles.addButton,
          }, '+ Add Artist'),
        ]),

        // Genres
        window.h('div', { style: styles.section }, [
          window.h('h4', { style: { marginTop: 0 } }, '🎵 Genres'),
          ...record.genre.map((genre, i) =>
            window.h('div', { key: i, style: styles.arrayItem }, [
              window.h('input', {
                type: 'text',
                value: genre,
                onChange: e => this.updateArrayField('genre', i, e.target.value),
                style: { ...styles.input, marginTop: 0 },
              }),
              window.h('button', {
                type: 'button',
                onClick: () => this.updateArrayField('genre', i, null),
                style: styles.removeButton,
              }, '✕'),
            ])
          ),
          window.h('button', {
            type: 'button',
            onClick: () => this.updateArrayField('genre', -1, ''),
            style: styles.addButton,
          }, '+ Add Genre'),
        ]),

        // Tracklist
        window.h('div', { style: styles.section }, [
          window.h('h4', { style: { marginTop: 0 } }, '💿 Tracklist'),
          ...record.sides.map((side, sideIdx) =>
            window.h('div', { key: sideIdx, style: { marginBottom: '20px' } }, [
              window.h('h5', {}, side.name),
              ...side.tracks.map((track, trackIdx) =>
                window.h('div', { key: trackIdx, style: styles.arrayItem }, [
                  window.h('span', { style: { minWidth: '30px' } }, `${trackIdx + 1}.`),
                  window.h('input', {
                    type: 'text',
                    value: track.title,
                    onChange: e => this.updateTrack(sideIdx, trackIdx, 'title', e.target.value),
                    placeholder: 'Track title',
                    style: { ...styles.input, marginTop: 0, flex: 2 },
                  }),
                  window.h('input', {
                    type: 'text',
                    value: track.duration,
                    onChange: e => this.updateTrack(sideIdx, trackIdx, 'duration', e.target.value),
                    placeholder: '0:00',
                    style: { ...styles.input, marginTop: 0, width: '80px' },
                  }),
                  window.h('button', {
                    type: 'button',
                    onClick: () => this.updateTrack(sideIdx, trackIdx, null, null),
                    style: styles.removeButton,
                  }, '✕'),
                ])
              ),
              window.h('button', {
                type: 'button',
                onClick: () => this.updateTrack(sideIdx, -1),
                style: { ...styles.addButton, fontSize: '12px', padding: '6px 12px' },
              }, `+ Add Track to ${side.name}`),
            ])
          ),
        ]),

        // Summary
        window.h('div', { style: { ...styles.section, backgroundColor: '#d4edda' } }, [
          window.h('h4', { style: { marginTop: 0 } }, '✅ Ready to Save'),
          window.h('p', {}, `Album: ${record.album || '(not set)'}`),
          window.h('p', {}, `ID: ${record.id || '⚠ REQUIRED'}`),
          window.h('p', {}, `Artists: ${record.artists.join(', ') || '(none)'}`),
          window.h('p', {}, `Tracks: ${record.sides.reduce((sum, s) => sum + s.tracks.length, 0)}`),
        ]),
      ]);
    },
  });

  /**
   * Register the widget
   */
  if (window.CMS) {
    window.CMS.registerWidget('vinyl-record', VinylRecordControl);
    // eslint-disable-next-line no-console
    console.log('✓ Vinyl Record widget registered');
  } else {
    console.error('DecapCMS not found');
  }
})();
