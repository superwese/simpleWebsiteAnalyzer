'use strict';

describe('WebSite.Checker.Editor module', function(){

  beforeEach(module('WebsiteParser.CheckEdit'));
  var $controller, scope;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
    scope = {};
  }));
  it('should have a Controller', function(){
    var ctrl = $controller('CheckEditorCtrl', {$scope: scope });
    expect(ctrl).toBeDefined();
  });

  describe('EditorCtrl', function() {
    var editor;

    beforeEach(function(){
      editor = $controller('CheckEditorCtrl', {$scope: scope });
    });

    it('should have active checks', function(){
      var active = editor.activeChecks;
      expect(Object.keys(active).length).toBeGreaterThan(0);
    });


    describe('create/remove Checks', function(){
      var numActive , nameToChoose,
          indexToChoose, editor;

      beforeEach(function(){
        editor = $controller('CheckEditorCtrl', {$scope: scope });
        numActive = Object.keys(editor.activeChecks).length;
        indexToChoose = Math.floor((Math.random() * numActive) );
        nameToChoose =  Object.keys(editor.activeChecks)[indexToChoose];
      });

      it('should remove a check', function() {
        var numAfterDelete;
        console.log("removing: ", nameToChoose, " from index: ", indexToChoose);
        editor.removeCheck(nameToChoose);
        numAfterDelete = Object.keys(editor.activeChecks).length;
        expect(numAfterDelete).toEqual(numActive - 1);

      });

      it('should create a check', function(){
        var creatorOptions,
            indexToCreate = Math.floor((Math.random() * Object.keys(editor.availableChecks).length)),
            nameToCreate = Object.keys(editor.availableChecks)[indexToCreate];

        console.log("creating: ", nameToCreate, " from index: ", indexToCreate);

        editor.newCheck(nameToCreate);
        creatorOptions = editor.creatorOptions
        expect(creatorOptions.typeToCreate).toEqual(nameToCreate);
        creatorOptions.name = 'createdByTest';
        creatorOptions.selector = 'a';
        if ( creatorOptions.needsAdditionalParameter === true ) {
          creatorOptions.additional = 'href';
        }
        editor.addCheck();
        expect(editor.creatingError).toBeUndefined();
        var nowActive = Object.keys(editor.activeChecks).length;
        expect(nowActive).toBe(numActive + 1);


      });
      it('should throw on missing parameter', function(){
        var creatorOptions,
            indexToCreate = Math.floor((Math.random() * Object.keys(editor.availableChecks).length)),
            nameToCreate = Object.keys(editor.availableChecks)[indexToCreate];

        nameToCreate = 'PropertyExtractingCheck';
        console.log("creating: ", nameToCreate, " from index: ", indexToCreate);

        editor.newCheck(nameToCreate);
        creatorOptions = editor.creatorOptions
        expect(creatorOptions.typeToCreate).toEqual(nameToCreate);
        creatorOptions.name = 'createdByTest';
        creatorOptions.selector = 'a';
        expect(editor.addCheck).toThrow();
        expect(editor.addCheck).toThrowError(RangeError, /needs/);


      });

    });


    it('should have available checks', function(){
      var available = editor.availableChecks;
      expect(available).toBeDefined();
      expect(Object.keys(available).length).toBeGreaterThan(1);

    });
  });



});
