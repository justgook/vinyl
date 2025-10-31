#!/usr/bin/env node

/**
 * Generate filter index files for Vinyl Cabinet
 * Creates artist, genre, year, and label filter data
 * Run: node generate-filters.js
 */

const fs = require('fs');
const path = require('path');

const RECORDS_DIR = path.join(__dirname, 'data', 'records');
const FILTERS_DIR = path.join(__dirname, 'data', 'filters');
const FILTER_TAGS_DIR = path.join(__dirname, 'data', 'filter-tags');
const RECORDS_ALL_PATH = path.join(__dirname, 'data', 'records-all.json');

// Ensure filters directory exists
if (!fs.existsSync(FILTERS_DIR)) {
  fs.mkdirSync(FILTERS_DIR, { recursive: true });
}

// Ensure filter-tags directory exists
if (!fs.existsSync(FILTER_TAGS_DIR)) {
  fs.mkdirSync(FILTER_TAGS_DIR, { recursive: true });
}

/**
 * Load all individual record files
 * @returns {Array} Array of record objects with full data
 */
function loadAllRecords() {
  const files = fs.readdirSync(RECORDS_DIR).filter(f => f.endsWith('.json'));
  const records = [];

  for (const file of files) {
    const filePath = path.join(RECORDS_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    records.push(data);
  }

  return records;
}

/**
 * Load minimal record data from records-all.json
 * @returns {Object} Map of record ID to minimal data
 */
function loadRecordsAllMap() {
  const data = JSON.parse(fs.readFileSync(RECORDS_ALL_PATH, 'utf8'));
  const map = {};
  
  for (const record of data.records) {
    map[record.id] = record;
  }
  
  return map;
}

/**
 * Generate artists filter index
 * @param {Array} records - Full record data
 * @param {Object} recordsAllMap - Minimal record data map
 */
function generateArtistsIndex(records, recordsAllMap) {
  const artistsMap = {};

  for (const record of records) {
    for (const artist of record.artists) {
      if (!artistsMap[artist]) {
        artistsMap[artist] = {
          name: artist,
          count: 0,
          records: []
        };
      }
      
      artistsMap[artist].count++;
      artistsMap[artist].records.push({
        id: record.id,
        album: record.album,
        artists: record.artists,
        year: record.year,
        imageUrl: recordsAllMap[record.id]?.imageUrl || record.imageUrl
      });
    }
  }

  // Sort records within each artist by year
  for (const artist in artistsMap) {
    artistsMap[artist].records.sort((a, b) => b.year - a.year);
  }

  const output = {
    artists: artistsMap,
    total: Object.keys(artistsMap).length
  };

  fs.writeFileSync(
    path.join(FILTERS_DIR, 'artists.json'),
    JSON.stringify(output, null, 2)
  );

  // Generate individual artist files
  for (const artist in artistsMap) {
    const artistData = {
      type: 'artist',
      name: artist,
      count: artistsMap[artist].count,
      records: artistsMap[artist].records
    };
    
    const safeFileName = artist.replace(/[^a-zA-Z0-9]/g, '_');
    fs.writeFileSync(
      path.join(FILTER_TAGS_DIR, `artist_${safeFileName}.json`),
      JSON.stringify(artistData, null, 2)
    );
  }

  console.log(`✓ Generated artists.json with ${output.total} artists`);
  console.log(`✓ Generated ${output.total} individual artist files`);
}

/**
 * Generate genres filter index
 * @param {Array} records - Full record data
 * @param {Object} recordsAllMap - Minimal record data map
 */
function generateGenresIndex(records, recordsAllMap) {
  const genresMap = {};

  for (const record of records) {
    if (record.genre) {
      for (const genre of record.genre) {
        if (!genresMap[genre]) {
          genresMap[genre] = {
            name: genre,
            count: 0,
            records: []
          };
        }
        
        genresMap[genre].count++;
        genresMap[genre].records.push({
          id: record.id,
          album: record.album,
          artists: record.artists,
          year: record.year,
          imageUrl: recordsAllMap[record.id]?.imageUrl || record.imageUrl
        });
      }
    }
  }

  // Sort records within each genre by year (newest first)
  for (const genre in genresMap) {
    genresMap[genre].records.sort((a, b) => b.year - a.year);
  }

  const output = {
    genres: genresMap,
    total: Object.keys(genresMap).length
  };

  fs.writeFileSync(
    path.join(FILTERS_DIR, 'genres.json'),
    JSON.stringify(output, null, 2)
  );

  // Generate individual genre files
  for (const genre in genresMap) {
    const genreData = {
      type: 'genre',
      name: genre,
      count: genresMap[genre].count,
      records: genresMap[genre].records
    };
    
    const safeFileName = genre.replace(/[^a-zA-Z0-9]/g, '_');
    fs.writeFileSync(
      path.join(FILTER_TAGS_DIR, `genre_${safeFileName}.json`),
      JSON.stringify(genreData, null, 2)
    );
  }

  console.log(`✓ Generated genres.json with ${output.total} genres`);
  console.log(`✓ Generated ${output.total} individual genre files`);
}

/**
 * Generate years filter index
 * @param {Array} records - Full record data
 * @param {Object} recordsAllMap - Minimal record data map
 */
function generateYearsIndex(records, recordsAllMap) {
  const yearsMap = {};

  for (const record of records) {
    const year = record.year.toString();
    
    if (!yearsMap[year]) {
      yearsMap[year] = {
        year: record.year,
        count: 0,
        records: []
      };
    }
    
    yearsMap[year].count++;
    yearsMap[year].records.push({
      id: record.id,
      album: record.album,
      artists: record.artists,
      year: record.year,
      imageUrl: recordsAllMap[record.id]?.imageUrl || record.imageUrl
    });
  }

  // Sort records within each year alphabetically by album
  for (const year in yearsMap) {
    yearsMap[year].records.sort((a, b) => a.album.localeCompare(b.album));
  }

  const output = {
    years: yearsMap,
    total: Object.keys(yearsMap).length
  };

  fs.writeFileSync(
    path.join(FILTERS_DIR, 'years.json'),
    JSON.stringify(output, null, 2)
  );

  // Generate individual year files
  for (const year in yearsMap) {
    const yearData = {
      type: 'year',
      name: year,
      count: yearsMap[year].count,
      records: yearsMap[year].records
    };
    
    fs.writeFileSync(
      path.join(FILTER_TAGS_DIR, `year_${year}.json`),
      JSON.stringify(yearData, null, 2)
    );
  }

  console.log(`✓ Generated years.json with ${output.total} years`);
  console.log(`✓ Generated ${output.total} individual year files`);
}

/**
 * Generate labels filter index
 * @param {Array} records - Full record data
 * @param {Object} recordsAllMap - Minimal record data map
 */
function generateLabelsIndex(records, recordsAllMap) {
  const labelsMap = {};

  for (const record of records) {
    const label = record.recordLabel;
    
    if (!labelsMap[label]) {
      labelsMap[label] = {
        name: label,
        count: 0,
        records: []
      };
    }
    
    labelsMap[label].count++;
    labelsMap[label].records.push({
      id: record.id,
      album: record.album,
      artists: record.artists,
      year: record.year,
      imageUrl: recordsAllMap[record.id]?.imageUrl || record.imageUrl
    });
  }

  // Sort records within each label by year (newest first)
  for (const label in labelsMap) {
    labelsMap[label].records.sort((a, b) => b.year - a.year);
  }

  const output = {
    labels: labelsMap,
    total: Object.keys(labelsMap).length
  };

  fs.writeFileSync(
    path.join(FILTERS_DIR, 'labels.json'),
    JSON.stringify(output, null, 2)
  );

  // Generate individual label files
  for (const label in labelsMap) {
    const labelData = {
      type: 'label',
      name: label,
      count: labelsMap[label].count,
      records: labelsMap[label].records
    };
    
    const safeFileName = label.replace(/[^a-zA-Z0-9]/g, '_');
    fs.writeFileSync(
      path.join(FILTER_TAGS_DIR, `label_${safeFileName}.json`),
      JSON.stringify(labelData, null, 2)
    );
  }

  console.log(`✓ Generated labels.json with ${output.total} labels`);
  console.log(`✓ Generated ${output.total} individual label files`);
}

// Main execution
console.log('🎵 Generating filter index files...\n');

const records = loadAllRecords();
const recordsAllMap = loadRecordsAllMap();

console.log(`📀 Loaded ${records.length} records\n`);

generateArtistsIndex(records, recordsAllMap);
generateGenresIndex(records, recordsAllMap);
generateYearsIndex(records, recordsAllMap);
generateLabelsIndex(records, recordsAllMap);

console.log('\n✨ All filter indexes generated successfully!');
