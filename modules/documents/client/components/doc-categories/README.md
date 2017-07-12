# Document Categories

Provides both the categories and the ability to edit them on a document model.  A document's categories contains an array of strings. For example:

```
Annual Report > Annual Reclamation Report
Inspection Report > Reclamation > Environmental Geoscience
```


See the original JIRA ticket [MEM-361](https://quartech.atlassian.net/browse/MEM-361) for more information

This module is mainly self-contained but it depends on the 'inspectionType' property defined as a virtual method on the Document model.

## Usage

To launch the editor from html use the `x-categories-modal` directive like this
```
<button class="btn btn-default btn-sm" id="documentCategories" x-categories-modal x-doc="doc">Set Categories</button>
```

Pass in an instance of the Document model.

On success the document will have it's `documentCategories` property set to the new list of categories.

It is up to the caller to actually save the model.  The directive will also set the `inspectionType` property to be the inspection category. This property is used in the document edit dialog to determine if inspection meta data should be available for the user to modify.

If the `inspectionType` is not empty then the directive will also set the document's `inspectionReport` property to null. 


