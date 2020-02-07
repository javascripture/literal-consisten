# Literal Consistent
A literal consistent bible translation

This takes the Hebrew and Greek texts and creates a CSV. Each row represents a letter from the bible, like this:

`word`,`lemma`,`morphology`,`morphology description`,`translation`

This is then imported into a Google doc so that the translation can be crowd sourced.

We then take this CSV and create a JSON object which can be used to show the same translation for each combination of these terms.

See an example on javascripture.org.

The texts we use are:
Hebrew - https://github.com/openscriptures/morphhb/
Greek - https://github.com/morphgnt/tischendorf

The parsing tools are:
Hebrew - https://github.com/openscriptures/morphhb-parsing
Greek - https://github.com/javascripture/morphgnt

To run the script:
`node csv.js import` - to create the JSON object from the CSV
`node csv.js export` - to create the CSV from the JSON object
