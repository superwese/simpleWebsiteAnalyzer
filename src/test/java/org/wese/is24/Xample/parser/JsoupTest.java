/*
 * Copyright 2016 ikke.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wese.is24.Xample.parser;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.net.UnknownHostException;
import java.util.List;
import org.jsoup.Connection;
import org.jsoup.Connection.Response;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.DocumentType;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 * This is not really a Testclass.
 * It's main pupose is to become used to Jsoup
 * @author ikke
 */
public class JsoupTest {

  public JsoupTest() {
  }

  @BeforeClass
  public static void setUpClass() {
  }

  @AfterClass
  public static void tearDownClass() {
  }

  @Before
  public void setUp() {
  }

  @After
  public void tearDown() {
  }

  /**
   * Test of doit method, of class Parser.
   */
  @org.junit.Test
  public void testDoit() throws Exception {

    InputStream stream = JsoupTest.class.getResourceAsStream("/sample.html");
    Document root = Jsoup.parse(stream, "utf-8", "http://example.org");

    Elements headings = root.select("h1,h2,h3,h4,h5,h6");

    for (Element header : headings) {
      System.out.println("tagname: " + header.tagName() + " nodename " + header.nodeName());
    }

    Elements anchors = root.select("a");
    System.out.println("alle as: " + anchors.size());

    Elements anchorsWithHref = root.select("a[href]");
    System.out.println(" as: mit href " + anchorsWithHref.size());

    for (Element a : anchorsWithHref) {
      System.out.println("absUrl: " + a.absUrl("href") + " rel Url: " + a.attr("href"));
    }

    boolean hasDoctype = false;
    boolean isHTML = false;
    boolean hasPublicId = false;
    boolean hasSystemID = false;
    String version = "unknown";
//    File sample = new File("sample.html");
//    Document root = Jsoup.parse(sample, "utf-8");

    //Object headers = root.;
    List<Node> nods = root.childNodes();
    for (Node node : nods) {
      System.out.println("nodename: " + node.nodeName());
      if (node instanceof DocumentType) {
        hasDoctype = true;
        DocumentType documentType = (DocumentType) node;
        System.out.println("name: " + documentType.attr("name"));
        if (documentType.hasAttr("name") && documentType.attr("name").equalsIgnoreCase("html")) {
          isHTML = true;
        }

        if (documentType.hasAttr("systemid")) {
          hasSystemID = true;
        }

        System.out.println("doctype: " + documentType.toString());
        if (documentType.hasAttr("publicid")) {
          hasPublicId = true;
          System.out.println("publicid: " + documentType.attr("publicid"));
        }

        if (isHTML) {
          version = "assume HTML5";
          if (hasPublicId) {
            version = documentType.attr("publicid"); // e.g HTML 3 has no systemid
          }
        }

        break;

      }
    }
    System.out.println("version: " + version);

    assertTrue("is not HTML", isHTML);
    assertTrue("has no doctype", hasDoctype);
  }

  @Test
  public void testRemote() throws IOException {
    Document root = Jsoup.connect("http://www.wese.org/sample.html").get();
    assertTrue(this.testaDoc(root));

  }
  
  @Test
  public void test404() throws IOException {
    Connection con = Jsoup.connect("http://www.wese.org/nosuchfile.html");
    con.ignoreHttpErrors(true);
    Response res = con.execute();
    assertEquals("Doesnot return 404", 404, res.statusCode());
    
  }
  
  @Test(expected=UnknownHostException.class)
  public void testUnrachable() throws Exception {
    Connection con = Jsoup.connect("http://hase.na.se");
    con.ignoreHttpErrors(true);
    Response res = con.execute();
  }
  
  @Test
  public void testConnection() throws IOException {
    Connection con = Jsoup.connect("http://www.wese.org/sample.html");
    con.ignoreHttpErrors(true);
    Response res = con.execute();
    assertEquals("Doesnot return 200", 200, res.statusCode());    
    
  }
  

  @Test
  public void testToJson() throws IOException {
    InputStream stream = JsoupTest.class.getResourceAsStream("/sample.html");
    Document root = Jsoup.parse(stream, "utf-8", "http://example.org");

    
    ObjectMapper jackson = new ObjectMapper();
    Element aHeader = root.select("h1").first();

    String htmlStr = root.toString();
    String jsonStr = jackson.writeValueAsString(htmlStr);
    System.out.println(jsonStr);
  }

  private boolean testaDoc(Document root) {
    Elements headings = root.select("h1,h2,h3,h4,h5,h6");

    for (Element header : headings) {
      System.out.println("tagname: " + header.tagName() + " nodename " + header.nodeName());
    }

    Elements anchors = root.select("a");
    System.out.println("alle as: " + anchors.size());

    Elements anchorsWithHref = root.select("a[href]");
    System.out.println(" as: mit href " + anchorsWithHref.size());

    for (Element a : anchorsWithHref) {
      System.out.println("absUrl: " + a.absUrl("href") + " rel Url: " + a.attr("href"));
    }

    boolean hasDoctype = false;
    boolean isHTML = false;
    boolean hasPublicId = false;
    boolean hasSystemID = false;
    String version = "unknown";
//    File sample = new File("sample.html");
//    Document root = Jsoup.parse(sample, "utf-8");

    //Object headers = root.;
    List<Node> nods = root.childNodes();
    for (Node node : nods) {
      System.out.println("nodename: " + node.nodeName());
      if (node instanceof DocumentType) {
        hasDoctype = true;
        DocumentType documentType = (DocumentType) node;
        
        System.out.println("name: " + documentType.attr("name"));
        if (documentType.hasAttr("name") && documentType.attr("name").equalsIgnoreCase("html")) {
          isHTML = true;
        }

        if (documentType.hasAttr("systemid")) {
          hasSystemID = true;
        }

        System.out.println("doctype: " + documentType.toString());
        if (documentType.hasAttr("publicid")) {
          hasPublicId = true;
          System.out.println("publicid: " + documentType.attr("publicid"));
        }

        if (isHTML) {
          version = "assume HTML5";
          if (hasPublicId) {
            version = documentType.attr("publicid"); // e.g HTML 3 has no systemid
          }
        }

        break;

      }
    }
    System.out.println("version: " + version);

    return isHTML && hasDoctype;
  }

}
