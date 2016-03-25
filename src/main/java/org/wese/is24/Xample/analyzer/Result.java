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

package org.wese.is24.Xample.analyzer;

import javax.enterprise.context.RequestScoped;
import javax.ws.rs.core.Response;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * This class represents the outcoming of the analyzing process.
 * 
 * Provides a fluent API to set its properties.
 * 
 * <code>
 *  Result myResult = new Result().withUrl("http://example.com").withResponseStatus(404);
 * </code>
 *
 * @author ikke
 */
@RequestScoped
@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class Result {
  
  private String source;
  private String url;
  
//  private Response.Status responseStatus;
  private int responseStatus;
  private String errormessage;
  private DocumentType docType;
  
  public Result() {
    
  }
  
  public Result withSource(String source) {
    this.source = source;
    return this;
  }
  
  public Result withUrl(String url) {
    this.url = url;
    return this;
  }
  
  public Result withResponseStatus( int statuscode ) {
    this.responseStatus = statuscode; //Response.Status.fromStatusCode(statuscode);
    return this;
  }
  
  public Result withErrormessage(String localizedMessage) {
    this.errormessage = localizedMessage;
    return this;
  }
  
  public Result withDocumentType(DocumentType docType) {
    this.docType = docType;
    return this;
  }
  
  public String getSource() {
    return source;
  }

  public String getUrl() {
    return url;
  }

  public String getErrormessage() {
    return errormessage;
  }

//  public Response.Status getResponseStatus() {
//    return responseStatus;
//  }
  
  
  /**
   * This class represents a DocType.
   * It has a fluent API to set its properties.
   * 
   */
  @XmlRootElement
  @XmlAccessorType(XmlAccessType.FIELD)
  public static class DocumentType {
    String publicName;
    String publicId;
    String systemId;

    public DocumentType() {
      
    }
    
    public DocumentType withPublicName(String publicName) {
      this.publicName = publicName;
      return this;
    }
    
    public DocumentType withPublicId(String pubId) {
      this.publicId = pubId;
      return this;
    }
    
    public DocumentType withSystemId(String sysId) {
      this.systemId = sysId;
      return this;
    }
  }

  
  
}
