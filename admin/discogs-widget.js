/**
 * DecapCMS Discogs Widget
 * Custom widget for searching Discogs API and auto-filling record metadata
 * 
 * Usage:
 * 1. Get a Discogs API token from https://www.discogs.com/settings/developers
 * 2. Enter your token in the widget settings
 * 3. Search by catalog number or album title
 * 4. Select the correct release to auto-fill all fields
 * 
 * @see https://www.discogs.com/developers
 */

(function () {
  'use strict';

  const DISCOGS_API_BASE = 'https://api.discogs.com';
  const USER_AGENT = 'VinylCabinet/1.0';

  /**
   * Discogs Search Widget Control Component
   */
  const DiscogsControl = window.createClass({
    getInitialState() {
      return {
        searchTerm: '',
        searchType: 'catno', // 'catno' or 'query'
        loading: false,
        results: [],
        error: null,
        apiToken: localStorage.getItem('discogs_api_token') || '',
        showTokenInput: !localStorage.getItem('discogs_api_token'),
        importedData: null,
      };
    },

    /**
     * Search Discogs API
     * @param {string} term - Search term (catalog number or album title)
     * @param {string} type - Search type ('catno' or 'query')
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
          headers: {
            'User-Agent': USER_AGENT,
          },
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
     * Fetch detailed release information
     * @param {string} resourceUrl - Discogs API resource URL
     */
    async fetchReleaseDetails(resourceUrl) {
      this.setState({ loading: true, error: null });

      try {
        const url = new URL(resourceUrl);
        url.searchParams.append('token', this.state.apiToken);

        const response = await fetch(url.toString(), {
          headers: {
            'User-Agent': USER_AGENT,
          },
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const release = await response.json();
        this.autoFillFields(release);
        this.setState({ loading: false, results: [] });
      } catch (error) {
        console.error('Discogs API Error:', error);
        this.setState({ 
          loading: false, 
          error: 'Failed to fetch release details. Please try again.' 
        });
      }
    },

    /**
     * Auto-fill CMS form fields from Discogs release data
     * @param {object} release - Discogs release object
     */
    autoFillFields(release) {
      const { onChange } = this.props;

      // Map Discogs data to our schema
      const recordData = {
        catalogNumber: release.labels?.[0]?.catno || '',
        recordLabel: release.labels?.[0]?.name || '',
        artists: release.artists?.map(a => a.name.replace(/\s\(\d+\)$/, '')) || [],
        album: release.title || '',
        year: release.year || new Date().getFullYear(),
        genre: release.genres || [],
        format: this.formatFormat(release.formats),
        imageUrl: release.images?.[0]?.uri || release.thumb || '',
        sides: this.parseSides(release.tracklist),
        externalIds: {
          discogs: release.uri?.replace('https://api.discogs.com/', '') || `release/${release.id}`,
        },
      };

      // Store the data in widget value and state
      this.setState({ 
        importedData: recordData,
        loading: false,
        results: [],
      });

      // Store in widget value so it appears in the form
      onChange(JSON.stringify(recordData, null, 2));
      
      // Try to fill other form fields using DOM manipulation
      try {
        this.fillFormFields(recordData);
        alert(`✅ Successfully imported:\n${recordData.album} by ${recordData.artists.join(', ')}\n\nData has been filled in the form fields below. Please review and adjust as needed.`);
      } catch (error) {
        console.error('Error filling form fields:', error);
        alert(`✅ Data imported!\n\n${recordData.album} by ${recordData.artists.join(', ')}\n\nPlease scroll down and copy the data from the "Imported Data" section below into the form fields.`);
      }
    },

    /**
     * Try to fill form fields using DOM manipulation
     * @param {object} data - Record data to fill
     */
    fillFormFields(data) {
      // This is a workaround since DecapCMS doesn't provide a direct API
      // We'll try to find and fill form fields by their labels
      
      const setFieldValue = (label, value) => {
        // Try to find field by label text
        const labels = document.querySelectorAll('label');
        for (const labelEl of labels) {
          if (labelEl.textContent.includes(label)) {
            // Find the input/textarea/select associated with this label
            const fieldId = labelEl.getAttribute('for');
            if (fieldId) {
              const field = document.getElementById(fieldId);
              if (field) {
                field.value = value;
                // Trigger change event
                field.dispatchEvent(new Event('change', { bubbles: true }));
                field.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          }
        }
      };

      // Fill simple fields
      if (data.catalogNumber) setFieldValue('Catalog Number', data.catalogNumber);
      if (data.recordLabel) setFieldValue('Record Label', data.recordLabel);
      if (data.album) setFieldValue('Album Title', data.album);
      if (data.year) setFieldValue('Release Year', data.year);
      if (data.format) setFieldValue('Format', data.format);
      if (data.imageUrl) setFieldValue('Cover Image', data.imageUrl);
      
      // Note: Artists, genres, sides are more complex (lists) and may need manual entry
    },

    /**
     * Format the format string
     * @param {array} formats - Discogs formats array
     * @returns {string}
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
     * @param {array} tracklist - Discogs tracklist array
     * @returns {array}
     */
    parseSides(tracklist) {
      if (!tracklist || tracklist.length === 0) {
        return [{ name: 'Side A', tracks: [] }, { name: 'Side B', tracks: [] }];
      }

      const sides = [];
      let currentSide = null;

      tracklist.forEach(track => {
        // Check if this is a side heading
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
            ...(track.artists && track.artists.length > 0 && {
              artists: track.artists.map(a => a.name.replace(/\s\(\d+\)$/, '')),
            }),
          });
        }
      });

      if (currentSide && currentSide.tracks.length > 0) {
        sides.push(currentSide);
      }

      // If we couldn't parse sides properly, try to split evenly
      if (sides.length === 0) {
        const tracks = tracklist
          .filter(t => t.type_ === 'track')
          .map(t => ({
            title: t.title,
            duration: t.duration || '0:00',
          }));
        
        const midpoint = Math.ceil(tracks.length / 2);
        return [
          { name: 'Side A', tracks: tracks.slice(0, midpoint) },
          { name: 'Side B', tracks: tracks.slice(midpoint) },
        ];
      }

      return sides;
    },

    /**
     * Save API token
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
     * Handle search form submit
     */
    handleSearch(e) {
      e.preventDefault();
      this.searchDiscogs(this.state.searchTerm, this.state.searchType);
    },

    /**
     * Render the widget
     */
    render() {
      const { forID, classNameWrapper } = this.props;
      const { loading, results, error, showTokenInput, apiToken } = this.state;

      return window.h(
        'div',
        { className: `${classNameWrapper} discogs-widget` },
        [
          // API Token Section
          window.h('div', { className: 'discogs-token-section', key: 'token' }, [
            showTokenInput
              ? window.h('div', { className: 'discogs-token-input' }, [
                window.h('label', {}, 'Discogs API Token:'),
                window.h('input', {
                  type: 'password',
                  value: apiToken,
                  onChange: e => this.setState({ apiToken: e.target.value }),
                  placeholder: 'Enter your Discogs API token',
                  style: { width: '100%', padding: '8px', marginTop: '4px' },
                }),
                window.h('div', { style: { marginTop: '8px' } }, [
                  window.h('button', {
                    type: 'button',
                    onClick: () => this.saveToken(),
                    style: { marginRight: '8px' },
                  }, 'Save Token'),
                  window.h('a', {
                    href: 'https://www.discogs.com/settings/developers',
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }, 'Get API Token'),
                ]),
              ])
              : window.h('div', { style: { marginBottom: '12px' } }, [
                window.h('span', { style: { color: '#28a745' } }, '✓ API Token configured'),
                window.h('button', {
                  type: 'button',
                  onClick: () => this.clearToken(),
                  style: { marginLeft: '12px', fontSize: '12px' },
                }, 'Clear Token'),
              ]),
          ]),

          // Search Form
          window.h('form', { onSubmit: e => this.handleSearch(e), key: 'search' }, [
            window.h('div', { className: 'discogs-search-type' }, [
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
              window.h('label', { style: { marginLeft: '16px' } }, [
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
            window.h('div', { className: 'discogs-search-input', style: { marginTop: '12px' } }, [
              window.h('input', {
                id: forID,
                type: 'text',
                value: this.state.searchTerm,
                onChange: e => this.setState({ searchTerm: e.target.value }),
                placeholder: this.state.searchType === 'catno' 
                  ? 'Enter catalog number (e.g., SHVL804)' 
                  : 'Enter album or artist name',
                style: { width: '70%', padding: '8px' },
              }),
              window.h('button', {
                type: 'submit',
                disabled: loading,
                style: { marginLeft: '8px', padding: '8px 16px' },
              }, loading ? 'Searching...' : '🔍 Search Discogs'),
            ]),
          ]),

          // Error Message
          error && window.h('div', { 
            className: 'discogs-error',
            style: { 
              color: '#d9534f', 
              padding: '12px', 
              marginTop: '12px',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
            },
            key: 'error',
          }, error),

          // Loading Indicator
          loading && window.h('div', { 
            className: 'discogs-loading',
            style: { padding: '12px', marginTop: '12px', textAlign: 'center' },
            key: 'loading',
          }, 'Searching Discogs...'),

          // Results
          results.length > 0 && window.h('div', { 
            className: 'discogs-results',
            style: { marginTop: '16px' },
            key: 'results',
          }, [
            window.h('h4', {}, `Found ${results.length} release(s):`),
            ...results.map((result) =>
              window.h('div', {
                key: result.id,
                className: 'discogs-result-item',
                style: {
                  display: 'flex',
                  padding: '12px',
                  marginBottom: '8px',
                  border: '2px solid #000',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                },
                onClick: () => this.fetchReleaseDetails(result.resource_url),
                onMouseEnter: e => {
                  e.currentTarget.style.backgroundColor = '#FFFF00';
                  e.currentTarget.style.transform = 'translateX(4px)';
                },
                onMouseLeave: e => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'translateX(0)';
                },
              }, [
                result.thumb && window.h('img', {
                  src: result.thumb,
                  alt: result.title,
                  style: { 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover',
                    marginRight: '16px',
                    border: '2px solid #000',
                  },
                }),
                window.h('div', { style: { flex: 1 } }, [
                  window.h('div', { 
                    style: { fontWeight: 'bold', marginBottom: '4px' } 
                  }, result.title),
                  window.h('div', { 
                    style: { fontSize: '14px', color: '#666' } 
                  }, [
                    result.year && `${result.year} · `,
                    result.label?.join(', '),
                    result.catno && ` · ${result.catno}`,
                  ].filter(Boolean).join('')),
                  result.format && window.h('div', { 
                    style: { fontSize: '12px', color: '#999', marginTop: '4px' } 
                  }, result.format.join(', ')),
                ]),
              ])
            ),
          ]),

          // Imported Data Display
          this.state.importedData && window.h('div', { 
            className: 'discogs-imported-data',
            style: { 
              marginTop: '16px', 
              padding: '16px', 
              backgroundColor: '#d4edda',
              border: '3px solid #000',
              borderRadius: '0',
              fontSize: '13px',
            },
            key: 'imported',
          }, [
            window.h('h4', { style: { marginTop: 0, marginBottom: '12px' } }, '✅ Imported Data - Copy to Form Fields Below'),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Album: '),
              this.state.importedData.album,
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Artists: '),
              this.state.importedData.artists.join(', '),
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Year: '),
              this.state.importedData.year,
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Label: '),
              this.state.importedData.recordLabel,
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Catalog #: '),
              this.state.importedData.catalogNumber,
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Genres: '),
              this.state.importedData.genre.join(', '),
            ]),
            window.h('div', { style: { marginBottom: '8px' } }, [
              window.h('strong', {}, 'Format: '),
              this.state.importedData.format,
            ]),
            window.h('div', { style: { marginBottom: '12px' } }, [
              window.h('strong', {}, 'Cover URL: '),
              window.h('a', { 
                href: this.state.importedData.imageUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              }, 'View Image'),
            ]),
            window.h('details', { style: { marginTop: '12px' } }, [
              window.h('summary', { style: { cursor: 'pointer', fontWeight: 'bold' } }, 'View Full JSON (for advanced users)'),
              window.h('pre', { 
                style: { 
                  marginTop: '8px', 
                  maxHeight: '300px', 
                  overflow: 'auto',
                  fontSize: '11px',
                  padding: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                } 
              }, JSON.stringify(this.state.importedData, null, 2)),
            ]),
          ]),
        ]
      );
    },
  });

  /**
   * Register the widget with DecapCMS
   */
  if (window.CMS) {
    window.CMS.registerWidget('discogs', DiscogsControl);
    // eslint-disable-next-line no-console
    console.log('✓ Discogs widget registered');
  } else {
    console.error('DecapCMS not found. Make sure this script loads after decap-cms.js');
  }
})();
