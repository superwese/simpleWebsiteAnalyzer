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
 * This Module provides the checkers that are used in the runs.
 * It contains a Service that provides the configured checks
 * and a Service that acts as a factory
 */

(function(){
    'use strict';
    /* globals angular */
    /* jshint browser:true */
    
    
    var checkMod = angular.module('WebsiteParser.Checker',[])
           .service('CheckerProvider', CheckerProvider)
           .service('CheckerFactory', CheckerFactory);
        
    CheckerProvider.$inject = [];
    function CheckerProvider() {
        var me = this;
        me.configuredCheckers = {};
        me.getCheckers = function () {
            return me.configuredCheckers;
        };
        me.getChecker = function(name) {
            return me.configuredCheckers[name];
        };
        me.putChecker = function(name, checker) {
            me.configuredCheckers[name] = checker;
        };
        me.deleteChecker = function(name) {
            delete me.configuredCheckers[name];
        };
        
        me.init = initFn;
        me.init();
        
        /*
         * 
         * set up some default checks
         */
        function initFn(){
            var titleExtractor = new TextExtractingCheck("title");
            me.putChecker("Extractor", titleExtractor);
            var headerCounter = new AggregateTagnameChecker(":header");
            me.putChecker("Alle Header", headerCounter);
            var hasloginForm = new CountingCheck("input[type=password]");
            hasloginForm.withFormatter(function(found){return found >0;});
            me.putChecker("hasLoginForm", hasloginForm);
//            var linkChecker = new AttributeExtractingCheck("a[href]", "href");
//            me.putChecker("linkChecker", linkChecker);
            
        }
        
        
    }
    
    CheckerFactory.$inject = ['AvailableChecks'];
    function CheckerFactory(AvailableChecks) {
        var me = this;

        me.newAttributeExtractingCheck = function(selector, attribute) {
            return new AvailableChecks.AttributeExtractingCheck(selector, attribute);
        };
        /*
         * 'CountingCheck': CountingCheck,
        'TextExtractingCheck': TextExtractingCheck,
        'AttributeExtractingCheck':AttributeExtractingCheck,
        'AggregateTagnameCheck': AggregateTagnameChecker,
        'PropertyExtractingCheck': PropertyExtractingCheck
         *
         */
    }

    
    
    /**
     * The Baseclass.
     * Ein Checker bekommt in seinem Konstruktor einen jQuery kompatiblen 
     * Selector übergeben. Seine <code> perform</code> Methode bekommt eine Nodelist 
     * (typischerweise ein Document) übergeben und mit dem Selector gefiltert.
     *  Auf die resultierende Nodelist führt er dann seine
     * <code>action</code> Methode aus. Das was da raus kommt ist von der konkreten Implementierung ab
     * und wird auf dem Property <code>result</code> gespeichert.
     * @param {type} selector
     * @returns {checker_L24.Check}
     */
    var Check = function (selector) {
        this.selector = selector;
        this.result = null;
        this.desc = "Ich mache nix";
        this.isUserEditable = true;

    };
    Check.prototype.constructor = Check;
    Check.prototype.action = function(listOfNodes){
        console.warn("this check has no action!", listOfNodes);
        return listOfNodes;
    };
    Check.prototype.perform = function(root) {
        var found = root.find(this.selector);
        this.result = this.action.call(this, found);
    };
    Check.prototype.describe = function() {
        //format() wäre ja schöner
        return this.desc + " " + this.selector;
    };
    Check.prototype.typeof = function() {
        return Object.getPrototypeOf(this).constructor.name;
    };
    Check.prototype.formatter = function(toFormat) {
        return toFormat.toString();
    };
    Check.prototype.toString = function() {
        return this.formatter(this.result);
    };
    Check.prototype.withFormatter = function(formatFn) {
        this.formatter = formatFn;
        return this;
    };
    
    /**
     * a Checker that returns the number of found nodes
     * @param {type} selector
     * @returns {checker_L24.CountingCheck}
     */
    var CountingCheck = function(selector) {
        Check.call(this, selector);
        this.desc = "Ich zähle alle";
        this.action = function(loN) {
            return loN.length;
        };

    };
    CountingCheck.prototype = Object.create(Check.prototype);
    CountingCheck.prototype.constructor = CountingCheck;
    
    
    /**
     * A checker that returns the textvalues of the nodes as an array
     * @param {type} selector
     * @returns {checker_L24.TextExtractingCheck}
     */
    var TextExtractingCheck = function(selector) {
        Check.call(this,selector);
        this.desc = "Ich extrahiere den Text von";
        this.action = function(loN) {
            var allTexts = [];
            angular.forEach(loN, function(node) {
                allTexts.push(angular.element(node).text());
            });
            return allTexts;
        };
    };
    TextExtractingCheck.prototype = Object.create(Check.prototype);
    TextExtractingCheck.prototype.constructor = TextExtractingCheck;
    
    /**
     * A checker that returns attributevalues
     * @param {type} selector 
     * @param {type} attribute
     * @returns {checker_L24.AttributeExtractingCheck}
     */
    var AttributeExtractingCheck = function(selector, attribute) {
        if ( ! attribute ) {
          throw new RangeError( "AttributeExtractingCheck needs an attribute" );
        }
        Check.call(this, selector);
        this.attrName = attribute;
        this.desc = "Ich hole die Werte des Attributes " + this.attrName;
        this.action = function(loN) {
            var allValues = [];
            angular.forEach(loN, function(node){
                allValues.push(angular.element(node).attr(this.attrName));
            },this);
            return allValues;
        };
    };
    
    AttributeExtractingCheck.prototype = Object.create(Check.prototype);
    AttributeExtractingCheck.prototype.constructor = AttributeExtractingCheck;
    
    var AggregateTagnameChecker = function(selector) {
        Check.call(this, selector);
        this.desc = "Ich zähle die Vorkommen unterschiedlicher Tags";
        this.action = function(loN) {
            var elements = {};
            angular.forEach(loN, function (element) {
                var tag = element.tagName;
                elements[tag] ? elements[tag]++ : elements[tag] = 1;
            }, this);
            return elements;
        };
        this.formatter = function(toFormat) {
        var parts = [];
        parts.push('<pre>');
        parts.push('Tagname\tAnzahl\n');
        angular.forEach(this.result,function(anzahl,tag){
            parts.push('' + tag + '\t' + anzahl +'\n');
        });
        parts.push('</pre>');
        return parts.join('');
        };
    };
    AggregateTagnameChecker.prototype = Object.create(Check.prototype);
    AggregateTagnameChecker.prototype.constructor = AggregateTagnameChecker;
        /**
     * A checker that returns propertyvalues
     * @param {type} selector 
     * @param {type} property
     * @returns a PropertyExtractingCheck
     */
    var PropertyExtractingCheck = function(selector, property) {
        if ( ! property ) {
            throw new RangeError("PropertyExtractingCheck needs an property");
        }
        Check.call(this, selector);
        this.propName = property;
        this.desc = "Ich hole die Werte des Properties ";
        this.action = function(loN) {
            var allValues = [];
            angular.forEach(loN, function(node){
                allValues.push(angular.element(node).prop(this.propName));
            },this);
            return allValues;
        };
    };
    
    PropertyExtractingCheck.prototype = Object.create(Check.prototype);
    PropertyExtractingCheck.prototype.constructor = PropertyExtractingCheck;
    
   checkMod.constant('AvailableChecks', {
        'CountingCheck': CountingCheck,
        'TextExtractingCheck': TextExtractingCheck,
        'AttributeExtractingCheck':AttributeExtractingCheck,
        'AggregateTagnameCheck': AggregateTagnameChecker,
        'PropertyExtractingCheck': PropertyExtractingCheck
    });

}());
