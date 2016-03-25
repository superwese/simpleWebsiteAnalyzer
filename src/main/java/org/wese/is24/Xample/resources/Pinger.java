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
package org.wese.is24.Xample.resources;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLDecoder;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.wese.is24.Xample.analyzer.Result;

/**
 *
 * Opens an HTTPConnection to the given URL.
 * Makes a HEAD Request and returns the servers responsecode.
 * @author ikke
 */
@Path("ping")
public class Pinger {

  @Path("{which}")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Result pingit(@PathParam("which") String which) throws UnsupportedEncodingException, MalformedURLException, IOException {
    String decodedUrl = URLDecoder.decode(which, "utf-8");
    URL url = new URL(decodedUrl);
    
    HttpURLConnection con = (HttpURLConnection) url.openConnection();
    con.setRequestMethod("HEAD");
    int responseCode = con.getResponseCode();
    

    
    Result res = new Result().withUrl(decodedUrl).withResponseStatus(responseCode);
    con.disconnect();
    
    return res;
  }

}
