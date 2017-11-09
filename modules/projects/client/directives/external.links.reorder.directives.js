'use strict';

angular.module('project')
  // x-reorder-external-links-modal attribute of a button
  .directive('reorderExternalLinksModal', ['$modal', '_', reorderExternalLinksModal])
  // x-reorder-collection-content element in the modal
  .directive('reorderExternalLinksContent', [reorderExternalLinks])
  .controller('externalLinksSortingController', externalLinksSortingController)
  ;

function reorderExternalLinksModal($modal, _) {
  return {
    restrict: 'A',
    scope: {
      list: '=',
      onSave: '='
    },
    link: function (scope, element, attributes) {
      element.on('click', function () {
        $modal.open({
          animation: true,
          templateUrl: 'modules/projects/client/views/project-partials/reorder-external-links-modal.html',
          controllerAs: 'vmm',
          size: 'lg',
          windowClass: 'doc-sort-order-modal fs-modal',
          controller: function ($modalInstance) {
            var vmm = this;
            // shallow copy of original list of links. We can sort this clone without affecting the original
            vmm.list = _.clone(scope.list);
            // sort the list by sort order
            vmm.list.sort(function (link1, link2) { return link1.order - link2.order; });

            vmm.cancel = function () {
              $modalInstance.dismiss('cancel');
            };

            vmm.ok = function () {
              $modalInstance.close(vmm.list);
            };
          }
        }).result
          .then(function (sortedList) {
            if (scope.onSave) {
              scope.onSave(sortedList);
            }
          })
          .catch(function (err) {
            if ('cancel' !== err && 'backdrop click' !== err) {
              console.log('Error in reorderExternalLinksModal ', err);
            }
          });
      });
    }
  };
}

function reorderExternalLinks() {
  var directive = {
    restrict: 'E',
    templateUrl: 'modules/projects/client/views/project-partials/reorder-external-links-content.html',
    controller: 'externalLinksSortingController',
    controllerAs: 'vm',
    scope: {
      list: '='
    }
  };
  return directive;
}

externalLinksSortingController.$inject = ['$scope', '$document', '$timeout'];
/* @ngInject */
function externalLinksSortingController($scope, $document, $timeout) {
  // initialize form values
  var vm = this;
  vm.dragging = false;
  vm.list = $scope.list;
  angular.forEach(vm.list, function (item) { item.selected = false; });

  /**
   * dnd-dragging determines what data gets serialized and send to the receiver
   * of the drop. While we usually just send a single object, here we send the
   * array of all selected items.
   */
  vm.getSelectedItemsIncluding = function (item) {
    item.selected = true;
    return vm.list.filter(function (obj) { return obj.selected; });
  };

  /** Set the list into dragging state, meaning the items that are being dragged are hidden. */
  vm.onDragStart = function (event) {
    vm.dragging = true;
  };

  /** Reset dragging state on the list */
  vm.onDragEnd = function (event) {
    vm.dragging = false;
  };

  /**
   * In the dnd-drop callback, we now have to handle the data array that we
   * sent above. We handle the insertion into the list ourselves. By returning
   * true, the dnd-list directive won't do the insertion itself.
   */
  vm.onDrop = function (items, index) {
    // deselect all
    angular.forEach(items, function (item) { item.selected = false; });

    // insert the items that were just dragged at the right position
    vm.list = vm.list.slice(0, index)
      .concat(items)
      .concat(vm.list.slice(index));

    // reset the sort order
    vm.resetOrder();
    return true;
  };

  /**
   * Last but not least, we have to remove the previously dragged items in the
   * dnd-moved callback.
   */
  vm.onMoved = function () {
    // remove the items that were just dragged (they are still selected)
    vm.list = vm.list.filter(function (item) { return !item.selected; });
    vm.resetOrder();
    $scope.list = vm.list;
  };

  vm.resetOrder = function () {
    angular.forEach(vm.list, function (item, i) { item.order = i + 1; });
  };
}
