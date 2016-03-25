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

import java.net.MalformedURLException;
import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import org.wese.is24.Xample.analyzer.Result;

/**
 * Fetches MalformedURLException and returns a {@link javax.ws.rs.core.Response} Response where 
 * an "x-reason" is filled with the exception's message.
 * The response's entity is filled with a {@link Result} with approbiate responseStatus and errorMessage.
 * @author ikke
 */
@ApplicationScoped
@Provider
public class MalformedURLExceptionMapper implements ExceptionMapper<MalformedURLException> {
  
  
  @Override
  public Response toResponse(MalformedURLException exception) {
    Result result = new Result().withResponseStatus(Status.BAD_REQUEST.getStatusCode()).withErrormessage(exception.getLocalizedMessage());
    return Response.status(Status.BAD_REQUEST)
            //TODO: get the result
            .entity(result)
            .header("x-reason", "error in URL" + exception.getMessage())
            .build();
  }
  

}
