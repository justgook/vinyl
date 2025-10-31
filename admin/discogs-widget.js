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
        fillStatus: null, // 'success', 'error', 'filling', or null
        copyStatus: null,
        filledFieldsCount: 0,
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
        fillStatus: null,
      });

      // Store in widget value so it appears in the form
      onChange(JSON.stringify(recordData, null, 2));
    },

    /**
     * Manually trigger form fill
     */
    handleAutoFill() {
      if (!this.state.importedData) return;

      this.setState({ fillStatus: 'filling' });
      
      try {
        this.fillFormFields(this.state.importedData);
      } catch (error) {
        console.error('Error filling form fields:', error);
        this.setState({ fillStatus: 'error' });
      }
    },

    /**
     * Copy JSON to clipboard
     */
    async handleCopyJSON() {
      if (!this.state.importedData) return;

      try {
        await navigator.clipboard.writeText(JSON.stringify(this.state.importedData, null, 2));
        this.setState({ copyStatus: 'success' });
        setTimeout(() => this.setState({ copyStatus: null }), 3000);
      } catch (error) {
        console.error('Copy failed:', error);
        this.setState({ copyStatus: 'error' });
      }
    },

    /**
     * Try to fill form fields using DOM manipulation
     * @param {object} data - Record data to fill
     */
    fillFormFields(data) {
      // Enhanced DOM manipulation with better selectors
      // Wait a bit for React to render
      setTimeout(() => {
        const setTextFieldValue = (label, value) => {
          // Find all labels and inputs
          const labels = Array.from(document.querySelectorAll('label'));
          const targetLabel = labels.find(l => l.textContent.trim().includes(label));
          
          if (targetLabel) {
            // Try to find associated input
            const fieldId = targetLabel.getAttribute('for');
            let field = fieldId ? document.getElementById(fieldId) : null;
            
            // If not found by ID, try finding next input/textarea
            if (!field) {
              const container = targetLabel.closest('div[class*="ControlContainer"]') || 
                              targetLabel.closest('div[class*="Widget"]') ||
                              targetLabel.parentElement;
              field = container?.querySelector('input, textarea');
            }
            
            if (field && (field.type === 'text' || field.type === 'number' || field.tagName === 'TEXTAREA')) {
              field.value = value;
              field.focus();
              field.blur();
              
              // Trigger multiple events to ensure React picks it up
              const events = ['input', 'change', 'blur'];
              events.forEach(eventType => {
                field.dispatchEvent(new Event(eventType, { bubbles: true }));
                field.dispatchEvent(new InputEvent(eventType, { bubbles: true, data: value }));
              });
              
              return true;
            }
          }
          return false;
        };

        // Fill simple text fields
        const filled = {
          catalogNumber: setTextFieldValue('Catalog Number', data.catalogNumber),
          recordLabel: setTextFieldValue('Record Label', data.recordLabel),
          album: setTextFieldValue('Album Title', data.album),
          year: setTextFieldValue('Release Year', String(data.year)),
          format: setTextFieldValue('Format', data.format),
        };

        console.warn('Auto-fill results:', filled);
        
        // Show which fields were filled
        const filledCount = Object.values(filled).filter(Boolean).length;
        if (filledCount > 0) {
          this.setState({ 
            fillStatus: 'success',
            filledFieldsCount: filledCount,
          });
        } else {
          this.setState({ fillStatus: 'error' });
        }
      }, 300);
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
            
            // Auto-fill button and status
            window.h('div', { 
              style: { 
                marginTop: '16px', 
                paddingTop: '16px', 
                borderTop: '2px solid #c3e6cb',
              } 
            }, [
              window.h('button', {
                type: 'button',
                onClick: () => this.handleAutoFill(),
                style: {
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#000',
                  color: '#FFFF00',
                  border: '3px solid #000',
                  cursor: 'pointer',
                  marginRight: '12px',
                  transition: 'all 0.2s',
                },
                onMouseEnter: (e) => {
                  e.target.style.backgroundColor = '#FFFF00';
                  e.target.style.color = '#000';
                  e.target.style.transform = 'translateY(-2px)';
                },
                onMouseLeave: (e) => {
                  e.target.style.backgroundColor = '#000';
                  e.target.style.color = '#FFFF00';
                  e.target.style.transform = 'translateY(0)';
                },
              }, '⚡ Auto-Fill Form Fields'),
              
              window.h('button', {
                type: 'button',
                onClick: () => this.handleCopyJSON(),
                style: {
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: '#FF10F0',
                  color: '#FFF',
                  border: '3px solid #000',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                },
                onMouseEnter: (e) => {
                  e.target.style.backgroundColor = '#00D9FF';
                  e.target.style.transform = 'translateY(-2px)';
                },
                onMouseLeave: (e) => {
                  e.target.style.backgroundColor = '#FF10F0';
                  e.target.style.transform = 'translateY(0)';
                },
              }, '📋 Copy Full JSON'),
              
              // Status messages
              window.h('div', { style: { marginTop: '12px' } }, [
                this.state.fillStatus === 'filling' && window.h('span', { 
                  style: { color: '#856404', fontWeight: 'bold' } 
                }, '⏳ Attempting to fill fields...'),
                
                this.state.fillStatus === 'success' && window.h('span', { 
                  style: { color: '#155724', fontWeight: 'bold' } 
                }, `✓ Filled ${this.state.filledFieldsCount} text fields! Now manually add: artists, genres, tracks, and image.`),
                
                this.state.fillStatus === 'error' && window.h('span', { 
                  style: { color: '#721c24', fontWeight: 'bold' } 
                }, '⚠ Auto-fill didn\'t work. Use the data above or click "Copy Full JSON".'),
                
                this.state.copyStatus === 'success' && window.h('span', { 
                  style: { color: '#155724', fontWeight: 'bold' } 
                }, '✓ JSON copied to clipboard!'),
                
                this.state.copyStatus === 'error' && window.h('span', { 
                  style: { color: '#721c24', fontWeight: 'bold' } 
                }, '⚠ Copy failed. Please select and copy the JSON manually.'),
              ]),
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
