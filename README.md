# simpleWebsiteAnalyzer
A simple Website Analyzer

Fetches the given URL and outputs some stats.
Can count Tags and such.
Follows the Links on the page and outputs stats.

## Requirements
- node 
- a modern webbrowser 
- a JEE7 container (tested with Glasfish4 and wildfly 10)

## Dependencies
- http://www.jsoup.org
- AngularJs and fellows

## Install

  <code>mvn install</code>

and deploy.

## Tests
Frontend tests are made with karma and jasmine

  <code>npm test</code>
  
runs a single test run.

  <code>npm run continue-test</code>
  
runs karma in server mode.
