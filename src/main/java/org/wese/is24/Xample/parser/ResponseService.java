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

import java.io.IOException;
import java.net.URL;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.ejb.Singleton;
import org.jsoup.Connection;
import org.jsoup.Connection.Response;
import org.jsoup.helper.HttpConnection;

/**
 * Provides @{link org.jsoup.Connection.Response}s.
 *
 * It uses a very simple size-based Cache. In real world Scenarios it should use methods of
 * HTTP-Caches to determinate expired, non-cacheable etc. Documents.
 *
 *
 * @author ikke
 */
@Singleton
public class ResponseService {

  private final int MAX_ENTRIES = 100;

  private Map<URL, Response> cache;

  public ResponseService() {
    // Create cache
    cache = new LinkedHashMap<URL, Response>(MAX_ENTRIES + 1, .75F, true) {

      @Override
      public boolean removeEldestEntry(Map.Entry eldest) {
        return size() > MAX_ENTRIES;
      }
    };
    cache = Collections.synchronizedMap(cache);
  }

  /**
   * returns a Response from Cache. If there is no cached response for the given URL, it tries to
   * obtain one from @{link #fetchFromRemote} Non successful responses are never cached.
   *
   * @param url the url to get
   * @return Resonse an org.jsoup.Connection.Response.
   * @throws IOException in case of error.
   */
  public Response get(URL url) throws IOException {
    if (cache.containsKey(url)) {
      return cache.get(url);
    }

    Response res = fetchFromRemote(url);

    if ( res.statusCode() >= 200 && res.statusCode() < 400 ) {
      cache.put(url, res);
    }

    return res;
  }
  
  public boolean containsURL(URL url) {
    return cache.containsKey(url);
  }

  private Response fetchFromRemote(URL url) throws IOException {
    Connection con = HttpConnection.connect(url);
    con.ignoreHttpErrors(false);
    return con.execute();
  }
}
