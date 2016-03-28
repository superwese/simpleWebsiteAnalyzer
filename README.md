<!DOCTYPE html>
<!--
Copyright 2016 ikke.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->
<html>
    <head>
        <title>README</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <div>
          <h2>Übersicht</h2>
          <p>Diese Applikation besteht aus 2 Teilen:</p>

          <ol>
            <li>dem Benutzerfrontend, das im Browser des Benutzers läuft</li>
            <li>einer Serverkomponente, die in einem Java EE Container läuft</li>
          </ol>
          <p>
          Die Serverkomponente fungiert lediglich als Proxy für den Client, da XHR Requests der SameOrigin Restriktion unterliegen.
          Die eigentliche Arbeit findet im Browser des Nutzers ab.
          </p>
          <p>
          Die Hauptmotivation für diesen Ansatz war die Erfahrung, dass gerade solche Analyseanwendungen im Vorwege nicht genau spezifiziert werden können. Es sollte deshalb möglich sein, Änderungen schnell und einfach umzusetzen. In dieser Anwendung kann der Nutzer die Anfragen selbst erstellen und bearbeiten.<br />.
            Dazu wird die wohlbekannte jQuery Selektorsyntax verwendet. Diese ist gut dokumentiert, weit verbreitet benutzt und hat einige nützliche Erweiterungen. (z.B.: ":headers", um alle Header eines Dokuments auszuwählen.)<br />
            Ein Nutzer kann basierend auf den selbstgewählten Selektoren verschiedene Arten von <i>Checks</i> erstellen:
          </p>

            <ul>Es gibt Checks um den Text aus
              <li>Elementen</li>
              <li>Element Attributen</li>
              <li>Element Properties</li> zu extrahieren
              <li>Elemente</li> zu zählen
            </ul>
          <p>
            Unabhängig von den nutzerdefinierten Checks wird immer ein <i>Link-Check</i> gemacht. Hier wird den auf der zu analysierenden Seite enthaltenen Links gefolgt. Es werden interne und externe Links gezählt und nicht erreichbare aufgelistet. Dazu nutzt der Client einen Service der Serverkomponente, die HTTP HEAD Requests an die übergebene URL macht und den Response Code zurückliefert. <br />
            Dadurch das der Client das gesamte Dokument hat, also weiß wie viele Links zu verfolgen sind, kann man dem Nutzer recht einfach Feedback zum Fortschritt der Auswertung geben.
          </p>
          <p>Checks können sich selbst "formatieren" (eine HTML Darstellung ihres Ergebnisses). Dies ist zur Zeit eine einfache Funktion, die ein Check dekoriert. Das hätte als Filter oder Directive implementiert werden sollen. Wurde es aber nicht, um das Projekt nicht aufzublähen (Auch spielte Zeit eine Rolle.).</p>
          <p>
            Man kann diskutieren, ob durch das Übertragen des gesamten HTML Dokumentes nicht zu viel Traffic erzeugt bzw. den Browser zu stark belastet. Dieser Einwand wurde von mir erstmal hintenangestellt, denn die zu analysierende Website ist ja öffentlich, die übertragenen Daten (weil keine Bilder, Scripte etc übertragen werden) also weniger als bei einem "normalen" Aufruf der Seite. Auch die Auswertung sollte den Browser nicht belasten, denn darin ein DOM zu parsen, sind Browser echt gut.<br />
            Würde man die Einwände gelten lassen und würde gleichzeitig die oben beschriebene Flexibilität der nutzerdefinierten Abfrage beibehalten wollen, so würde sich so etwas wie </p>
            <blockquote>
              <a href="http://gdom.graphene-python.org">gdom</a> A Python implementation of DOM-Parsing using GraphQL. <br />
            </blockquote>
          <p>
            anbieten. Aber es war ja auch ein JavaEE container verlangt und ich konnte so schnell nicht gut genug Python lernen.
          </p>
          <h2>Annahmen</h2>
            <ul>
                <li>Die Applikation ist nicht öffentlich. Die Applikation ist vom Prinzip ein Einfallstor, um DOS-Attacken zu verschleiern.
                    Es wurden keine Sicherheitsmechanismen (Authentifizierung/Autorisierung) eingebaut</li>
            </ul>
          <h2>Requirements</h2>
            <ul>
              <li>maven (3.3.9)</li>
              <li>node (2.11.x)</li>
              <li>a JavaEE 7 container (tested with Glassfish and wildfly 10)</li>
              <li>a modern webbrowser</li>
            </ul>

          <h2>Dependencies</h2>
          <ul>
            <li><a href="http://www.jsoup.org">jsoup</a></li>
            <li>AngularJS and fellows</li>
          </ul>

          <h2>Install</h2>
          <blockquote>
            <code>mvn install</code>
            and deploy
            <p><i>has to be run from the commandline on OS X > 10.11 and Netbeans IDE 8.1</i></p>
          </blockquote>

          <h2>Tests</h2>
          <p>
            There are no real UnitTests for the Backend. It was considered to be <i>"too simple to fail"</i>.<br />
            Frontend tests are made with karma / jasmine. <br />
            <code>npm test</code> runs a single test-run.<br />
            <code>npm run continue-test</code> runs karma in server mode.<br />
          </p>
          <p>The frontend has been tested on OS X using Safari, Chrome and Firefox</p>

          <h2>Dinge, die getan werden sollten (neben anderen)</h2>
          <ul>
            <li>Tests für einzelne Checks</li>
            <li>build-Scripts zum minifizieren, concat der Script Dateien</li>
          </ul>

          <h2>Dinge, die man noch mal tun könnte (Auswahl)</h2>
          <ul>
            <li>Anstatt jQuery zu benutzen, <a href="https://sizzlejs.com">Sizzle</a> direkt benutzen.</li>
            <li></li>
          </ul>
          <!--

            <ul>
                <li>usually one would split the Frontend from the backend into different (sub-)projects. This wasn't done here to keep it lean</li>
                <li>Normalerweise würde man die zugrundeligende Parserimplementierung (hier Jsoup) weg abstrahieren.<br /> Das würde eine Menge Boilerplate erzeugen. <br />
                    Aus Zeit und Übersichtlichkeitsgründen wurde deshalb darauf verzichtet.
                </li>
            </ul>
            <h2>Goals</h2>
            <ul>
                <li>minimalistic REST-Service</li>
                <li>few dependencies as possible</li>
                <li>provide an API that can easily adopt changes in Requirements. Ideally let the user create new Queries.  </li>

            </ul>
            <h2>TODO</h2>
            <ul>
                <li>Consider using GSON</li>
                <li>use sub Resources</li>
                <li>consider using AsyncResponses (Suspended)</li>
                <li>consider versioning</li>
            </ul>

            <h2>Things not done</h2>
            <ul>
                <li>
                </li>
            </ul>
            <h2>Things, that should have been done</h2>
            <ul>
                <li>Unit Tests use real URLs. This should be mocked.</li>
            </ul>
            <h2>Testing</h2>
            <ul>
                <li>http://antoniogoncalves.org/2012/12/19/test-your-jax-rs-2-0-web-service-uris-without-mocks/</li>
            </ul>
-->
        </div>

    </body>
</html>
