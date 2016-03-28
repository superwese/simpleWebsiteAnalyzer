'use strict';

describe('WebSite.Checker module', function(){

  beforeEach(module('WebsiteParser.Runner'));

  var $controller;
  beforeEach(inject(function (_$controller_){
    $controller = _$controller_;
  }));

  it('should have a controller', function(){
    var ctrl = $controller('RunnerCtrl', {$scope:{}});
    expect(ctrl).toBeDefined();
  });



});

  describe('RunnerController', function(){
    var src = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">' +
'<html><head></head><body></body></html>';

    var $controller, $httpBackend, $rootScope, createController, sourceRequestHandler, pingRequestHandler,
        sampleResponse = {
          source: src,
          docType: {
            publicName: "HTML",
            publicId: "thePublicId",
            systemId: "theSystemId"
          },
          responseStatus: 200
        };

    beforeEach(module('WebsiteParser.Runner'));

    beforeEach(inject(function($injector) {
      $httpBackend = $injector.get('$httpBackend');
     // backend definition common for all tests
      $httpBackend.when('GET', 'urls/analyze/sample')
                            .respond(sampleResponse);

      $httpBackend.when('GET', /urls\/ping\/(.+)/, undefined, undefined, ['dings'] )
                          .respond(sampleResponse);

     $controller = $injector.get('$controller');

    }));


    afterEach(function() {
//      $httpBackend.verifyNoOutstandingExpectation();
//      $httpBackend.verifyNoOutstandingRequest();
    });


    it('should fetch and not throw', function() {
//     $httpBackend.expectGET('urls/analyze/sample');
     var controller = $controller('RunnerCtrl', {'$scope' : {} });
      controller.toFetch = 'sample';
      expect(controller.fetch).not.toThrow();
      $httpBackend.flush();
    });

    it('should extract the correct docType', function() {
      var controller = $controller('RunnerCtrl', {'$scope' : {} }),
          theDocType = sampleResponse.docType,
          gottenDocType = controller.ermitteleDocType(theDocType),
          expectecdString = theDocType.publicName.toUpperCase() + ' ' + theDocType.publicId + ' ' + theDocType.systemId;
      expect(gottenDocType).toEqual(expectecdString);

    })



  });
