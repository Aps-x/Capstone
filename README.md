# Capstone Project

## Project Overview

This project was sponsored by Dr. Ana Goulart as part of the University of Canberra's ITS Capstone Program. Our team was tasked with visualizing a dataset produced by the CSIRO -- a synthetic model of the Australian Eastern Power Grid.

Our solution is a fully client-side web application that accepts geojson spatial data and visualizes it on a web map. This solution aids users in improving their understanding of the dataset in a visual and accessible way.

## User Guide

1. Navigate to the website [here](aps-x.github.io/Capstone/)
2. Click 'Import Data'
3. Click 'Browse' and select your geojson data
4. Press the 'Apply' button
5. Et voilà, enjoy your visualized data!

## Developer Guide

1. Install the 'Visual Studio Code' IDE
2. Install the 'Live Server' extension by Ritwick Dey
3. Install the 'Live Sass Compiler' extension by Glenn Marks
4. (Optional) Install 'Inline HTML' extension by pushqrdx
5. Clone the repo with your preferred method of using Git version control

## Architecture & Design

TODO: Diagrams

### Technology Stack

| Category | Technology Used | Reason for Selection |
| :--- | :--- | :--- |
| **Markup** | HTML | Standard
| **Styling** | Sass | Concatenation nesting is useful for following the BEM naming convention. Additional benefits inlude: precompiling partial stylesheets, mixins, and loops.
| **Frontend** | JavaScript Custom Elements | Performance, simplicity, familiarity. Curious to see if it would work at this scale. |
| **Database** | IndexedDB | Native, local solution that works offline. |
| **Infrastructure** | Github Pages | Free and easy to deploy. |
| **Libraries** | MapLibre | Free and open source. |

## Acknowledgments

Special thanks to:

* Kevin Powell for the accessible accordion
* Josh Comeau for the cool 3D button
* Adam Argyle for the toast component
* Wes Bos for the center truncating text trick
* CJ (Coding Garden) for the MapLibre and OpenFreeMap example
* The entire web development community for being so awesome and open to sharing knowledge

## Appendix