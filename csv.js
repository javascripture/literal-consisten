const fs = require('fs');
var morphhb = require( "./morphhb.js" );
var tischendorf = require( "./tischendorf.js" );
var MorphParse = require( "./MorphParse.js" );
var parseGreekMorph = require( "./morphgnt-parse.js" );
var data = Object.assign( {}, morphhb, tischendorf );
var literalConsistent = require( "./LC.js" );

var words = {};
function getWordFromWord( word ) {
    if ( word && word.length > 0 ) {
        return word[0];
    }

    return null;
}
function getLemmaFromWord( word ) {
    if ( word && word.length > 0 ) {
        return word[1];
    }

    return null;
}

function getMorphFromWord( word ) {
    if ( word && word.length > 0 ) {
        return word[2];
    }

    return null;
}

function ConvertToCSV( words ) {
    var str = '';

    Object.keys( words ).forEach( word => {
        Object.keys( words[ word ] ).forEach( lemma => {
            Object.keys( words[ word ][ lemma ] ).forEach( morph => {
                let morphCode;
                if ( lemma.indexOf( 'G' ) === 0 ) {
                    morphCode = parseGreekMorph( morph );
                } else {
                    const morphParseObject = new MorphParse();
                    morphCode = morphParseObject.Parse( morph );
                }

                str += word + ','
                str += lemma + ','
                str += morph + ','
                str += morphCode + ','
                str += words[ word ][ lemma ][ morph ]
                str += '\r\n';
            } );
        } );
    } );

    return str;
}

function generateCSV() {
    var allBooks = ['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','I Samuel','II Samuel','I Kings','II Kings','I Chronicles','II Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi', 'Matthew','Mark','Luke','John','Acts','Romans','I Corinthians','II Corinthians','Galatians','Ephesians','Philippians','Colossians','I Thessalonians','II Thessalonians','I Timothy','II Timothy','Titus','Philemon','Hebrews','James','I Peter','II Peter','I John','II John','III John','Jude','Revelation of John'];
    var morphString = '';
    allBooks.forEach( book => data[ book ].forEach( ( chapter, chapterNumber ) => chapter.forEach( ( verse, verseNumber ) => verse.forEach( word => {
        const wordString = getWordFromWord( word );
        const lemma = getLemmaFromWord( word );
        const morph = getMorphFromWord( word )
        if ( lemma ) {
            wordArray = wordString.split('/');
            lemmaArray = lemma.split('/');
            morphArray = morph.split('/');

            wordArray.forEach( ( wordInArray, key ) =>  {
                var wordForWord = wordInArray.replace(/[,·;\.:]+\s*$/, "").toLowerCase();
                if ( ! words[ wordForWord ] ) {
                    words[ wordForWord ] = {};
                }

                var lemmaForWord = lemmaArray[ key ];
                if ( ! lemmaForWord ) {
                    lemmaForWord = '';
                }

                if ( ! words[ wordForWord][ lemmaForWord ] ) {
                    words[ wordForWord][ lemmaForWord ] = {};
                }

                var morphForWord = morphArray[ key ];
                if ( ! morphForWord ) {
                    morphForWord = 'no-morph';
                }

                if ( morph.indexOf( 'H' ) === 0 && key > 0 ) {
                    morphForWord = 'H' + morphForWord;
                }

                if ( morph.indexOf( 'A' ) === 0 && key > 0 ) {
                    morphForWord = 'A' + morphForWord;
                }

                var literalTranslation = literalConsistent[ wordForWord ][ lemmaForWord ][ morphForWord ];

                // remove commas
                literalTranslation = literalTranslation ? literalTranslation.replace(/(^,)|(,$)/g, "") : literalTranslation;
                literalTranslation = literalTranslation ? literalTranslation.replace(/"/g, "") : literalTranslation;
                words[ wordForWord][ lemmaForWord ][ morphForWord ] = literalTranslation;
            } );

        }
    } ) ) ) );
    fs.writeFile('literalconsistent.csv', ConvertToCSV( words ), function() { console.log( 'export done - created literalconsistent.csv' ) } );
}

function generateObject() {
    var file = fs.readFileSync( 'literalconsistent.csv', 'utf-8' );
    if (file) {
        var listOfWords = file.split('\r\n');
        listOfWords.shift();
        //console.log( listOfWords );
        listOfWords.forEach( word => {
            var wordArray = word.split( ',' );
            if ( ! words[ wordArray[0] ] ) {
                words[ wordArray[0] ] = {};
            }

            if ( ! words[ wordArray[0] ][ wordArray[1] ] ) {
                words[ wordArray[0] ][ wordArray[1] ] = {};
            }

            words[ wordArray[0] ][ wordArray[1] ][ wordArray[2] ] = wordArray[4];
        } );

        fs.writeFile('./data/LC.js', 'var literalConsistent = ' + JSON.stringify( words ) + ';module.exports=literalConsistent;', function() { console.log( 'inport done - created data/LC.js' ) } );
    }
}
if ( process.argv[2] === 'import') {
    generateObject();
    return;
}

if ( process.argv[2] === 'export') {
    generateCSV();
    return;
}

console.log( 'specify an argument, either import or export' );
