package org.wese.is24.Xample.resources;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.List;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.jsoup.Connection.Response;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.select.Elements;
import org.wese.is24.Xample.analyzer.Result;
import org.wese.is24.Xample.analyzer.Result.DocumentType;
import org.wese.is24.Xample.parser.ResponseService;

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


/**
 * This is the Resource class for the '/analyze' Entrypoint.
 * 
 * It uses the <a href="http://jsoup.org">jsoup</a> library to parse the HTML.
 * @author ikke
 */
@RequestScoped //as by default, but neccesarry for CDI
@Path("analyze")
public class Analyzer {

  @Inject
  ResponseService responder;
  /**
   * Fetches the given URL and returns a {@link Result} <code>result</code>.
   * The <code>result</code> <code>source</code> property is set with the HTML source code.
   * All links in the source are converted to absolute Links.
   * 
   * The <code>result.docType</code> property is filled with a DocumentType.
   * 
   * @param which url-encoded String  
   * @return a Result
   * @throws UnsupportedEncodingException
   * @throws MalformedURLException
   * @throws IOException 
   */
  @Path("{which}")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Result getSource(@PathParam("which") String which) throws UnsupportedEncodingException, MalformedURLException, IOException {

    //@TODO: 
    String decodedUrl = URLDecoder.decode(which, "utf-8");
    Result res = new Result().withUrl(decodedUrl);
    URL url = new URL(decodedUrl);
    Response jsoupResponse = responder.get(url);
    Document theDocument = jsoupResponse.parse();
    DocumentType docType = extractDocType(theDocument);
    theDocument = this.rel2Abs(theDocument);
    res.withResponseStatus(jsoupResponse.statusCode())
       .withSource(theDocument.toString())
       .withDocumentType(docType);
    return res;

  }

  /**
   * Extracts the DocumentType from the given Document.
   * @param doc a jspoupDocument
   * @return a DocumentType with possibly empty publicName, publicId and SystemId;
   */
  private DocumentType extractDocType(Document doc) {
    List<Node> nodes = doc.childNodes();
    String name = "";
    String publicId = "";
    String systemId = "";
    
    for (Node node : nodes) {
      if (node instanceof org.jsoup.nodes.DocumentType) {
        org.jsoup.nodes.DocumentType documentType = (org.jsoup.nodes.DocumentType) node;
        name = documentType.attr("name");
        systemId = documentType.attr("systemid");
        publicId = documentType.attr("publicid");
        break;
      }
    }
    return new DocumentType().withPublicName(name).withPublicId(publicId).withSystemId(systemId);
  }
  /**
   * changes all hrefs in anchors to abosulte URLs.
   * This is to make it easier to check their availability and to detect "#" Links
   * @param doc
   * @return doc with all links converted to absolute URLs
   */
  private Document rel2Abs(Document doc){
    Elements anchorsWithHref = doc.select("a[href]");
    
    for ( Element el : anchorsWithHref ) {
      el.attr("href", el.absUrl("href") );
    }
    return doc;
  }

}
