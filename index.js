(function() {
  'use strict';

  angular
    .module('mdfp', ['ui.bootstrap'])

  .constant("GoogleWebFonts", {
      "URL": "https://www.googleapis.com/webfonts/v1/webfonts?key=",
      "API_KEY": "AIzaSyBNgNkqkr7AY_t1WsZ6VDV9kN-3NGwxKM4"
    })
    .service('fontService', ['GoogleWebFonts', '$http', '$q', fontService])
    .controller('PickerController', ['fontService', '$scope', '$uibModal', PickerController])
    .controller('DialogController', ['font', '$uibModalInstance', DialogController])
    .filter('categoryFilter', CategoryFilter)
    .filter('variantFilter', VariantFilter)
    .filter('subsetFilter', SubsetFilter)
    .filter('startFrom', StartFromFilter)
    .directive('pickerFont', function($rootScope, $window) {
      return {
        restrict: "A",
        scope: {
          family: '='
        },
        link: function(scope) {
          $window.WebFont.load({
            google: {
              families: [scope.family]
            }
          });
        }
      };
    });

  function CategoryFilter() {
    return function(input, category) {
      return createPropertyFilter(input, "category", category);
    };
  }

  function VariantFilter() {
    return function(input, variant) {
      return createPropertyFilter(input, "variants", variant);
    };
  }

  function SubsetFilter() {
    return function(input, subset) {
      return createPropertyFilter(input, "subsets", subset);
    };
  }

  function StartFromFilter() {
    return function(input, start) {
      if (!input || !input.length) {
        return;
      }
      start = +start;
      return input.slice(start);
    };
  }

  function fontService(GoogleWebFonts, $http, $q) {
    var fonts = [];
    var fontsFamily = [];
    var fontCategories = [];
    var fontVariants = [];
    var fontSubsets = [];

    var saveProperties = function(list, data) {
      for (var i = 0; i < data.length; i++) {
        if (list.indexOf(data[i]) === -1) {
          list.push(data[i]);
        }
      }
    };

    var retrieve = function() {
      var promise = $http.get(GoogleWebFonts.URL + GoogleWebFonts.API_KEY)
        .then(function(resp) {
          saveFonts(resp.data.items);
        }).catch(function(resp) {
          console.log(resp.data.error.message);
        });
      return promise;
    };

    var saveFonts = function(data) {
      for (var i = 0; i < data.length; i++) {
        var font = data[i];
        font.family = data[i].family;
        font.category = data[i].category;
        font.variants = data[i].variants;
        font.subsets = data[i].subsets;
        fonts[i] = font;
        fontsFamily[i] = font.family;
        saveProperties(fontCategories, [font.category]);
        saveProperties(fontVariants, font.variants);
        saveProperties(fontSubsets, font.subsets);
      }
    };

    retrieve();

    return {
      fonts: fonts,
      categories: fontCategories,
      variants: fontVariants,
      subsets: fontSubsets
    };
  }

  function DialogController(font, $uibModalInstance) {
    var dialog = this;
    dialog.font = font;
    dialog.text = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
    dialog.cancelForm = function() {
      $uibModalInstance.dismiss();
    };
  }

  function PickerController(fontService, $scope, $uibModal) {
    var picker = this;
    picker.text = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
    picker.fonts = fontService.fonts;
    picker.fontsCategories = fontService.categories;
    picker.fontsVariants = fontService.variants;
    picker.fontsSubsets = fontService.subsets;
    picker.fontCurrentPage = 0;
    picker.fontPageSize = 12;

    picker.currentCategory = null;
    picker.setCategoryFilter = function(index, category) {
      if (picker.activeCategoryIndex == index) {
        picker.activeCategoryIndex = null;
        picker.currentCategory = null;
      } else {
        picker.activeCategoryIndex = index;
        picker.currentCategory = category;
      }
    };
    picker.currentVariant = null;
    picker.setVariantFilter = function(index, variant) {
      if (picker.activeVariantIndex == index) {
        picker.activeVariantIndex = null;
        picker.currentVariant = null;
      } else {
        picker.activeVariantIndex = index;
        picker.currentVariant = variant;
      }
    };
    picker.currentSubset = null;
    picker.setSubsetFilter = function(index, subset) {
      if (picker.activeSubsetIndex == index) {
        picker.activeSubsetIndex = null;
        picker.currentSubset = null;
      } else {
        picker.activeSubsetIndex = index;
        picker.currentSubset = subset;
      }
    };

    picker.activeCategoryIndex = null;
    picker.activeCategoryIndexEvt = function(index) {
      if (picker.activeCategoryIndex == index) {
        return true;
      }
      return false;
    };
    picker.activeVariantIndex = null;
    picker.activeVariantIndexEvt = function(index) {
      if (picker.activeVariantIndex == index) {
        return true;
      }
      return false;
    };
    picker.activeSubsetIndex = null;
    picker.activeSubsetIndexEvt = function(index) {
      if (picker.activeSubsetIndex == index) {
        return true;
      }
      return false;
    };
    picker.showDg = function(font) {
      $uibModal.open({
        template: '<div class="modal-header">' +
          '<h3 class="modal-title" id="modal-title">Font dialog</h3>' +
          '</div>' +
          '<div class="modal-body" id="modal-body">' +
          '<div class="panel panel-default">' +
          '<div class="panel-body" style="padding:0px;">' +
          '<input style="width:100%;font-size:65px;border:0px;font-family:{{dialog.font.family}}" type="text" picker-font family="dialog.font.family" ng-model="dialog.text"/>' +
          '</div>' +
          '<div class="panel-footer"><span style="font-size:12px;">{{dialog.font.family}}</span></div>' +
          '</div>' +
          'Add this JavaScript tag to the <head> of your website\'s HTML:<br>' +
          '<div class="well">{{dialog.font.files.regular}}</div>' +
          '</div>' +
          '<div class="modal-footer">' +
          '<button class="btn btn-primary" type="button" ng-click="dialog.cancelForm()">Cancel</button>' +
          '</div>',
        controller: 'DialogController',
        controllerAs: 'dialog',
        resolve: {
          font: function() {
            return font;
          },
        }
      });
    };
  }

  function createPropertyFilter(input, name, value) {
    if (value === null || value === undefined || value === "") {
      return input;
    }
    var list = [];
    for (var i = 0; i < input.length; i++) {
      if (typeof value == "string" && input[i][name] == value) {
        list.push(input[i]);
      } else if (typeof value == "object") {
        for (var v = 0; v < input[i][name].length; v++) {
          if (input[i][name][v] == value) {
            list.push(input[i]);
          }
        }
      }
    }
    return list;
  }
})();