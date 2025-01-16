import {
  AddCommentToElementOptions,
  CommentOutPropOptions,
  ConvertDimensionValueToPxOptions,
  MovePropToNewChildComponentOptions,
  MovePropToParentComponentOptions,
  MoveRenderPropsOptions,
  RemoveComponentIfWithinParentOptions,
  RemovePropOptions,
  UpdateComponentIfPropPresentOptions,
  UpdateComponentWithinCollectionOptions,
  UpdatePlacementToSingleValueProps,
  UpdatePropNameAndValueOptions,
  UpdatePropNameOptions,
  UpdatePropValueAndAddNewPropOptions,
  UpdateToNewComponentOptions
} from './transforms';

type FunctionInfo =
  | { name: 'commentOutProp', args: CommentOutPropOptions }
  | { name: 'removeProp', args: RemovePropOptions }
  | { name: 'updatePropNameAndValue', args: UpdatePropNameAndValueOptions }
  | {
      name: 'updatePropValueAndAddNewProp',
      args: UpdatePropValueAndAddNewPropOptions
    }
  | { name: 'updatePropName', args: UpdatePropNameOptions }
  | {
      name: 'updateComponentIfPropPresent',
      args: UpdateComponentIfPropPresentOptions
    }
  | { name: 'updateToNewComponent', args: UpdateToNewComponentOptions }
  | { name: 'moveRenderPropsToChild', args: MoveRenderPropsOptions }
  | { name: 'removeProp', args: RemovePropOptions }
  | {
      name: 'updateComponentWithinCollection',
      args: UpdateComponentWithinCollectionOptions
    }
  | {
      name: 'updateTabs',
      args: {}
    }
  | {
      name: 'movePropToNewChildComponent',
      args: MovePropToNewChildComponentOptions
    }
  | {
      name: 'movePropToParentComponent',
      args: MovePropToParentComponentOptions
    }
  | {
    name: 'convertDimensionValueToPx',
    args: ConvertDimensionValueToPxOptions
  }
  | {
    name: 'updatePlacementToSingleValue',
    args: UpdatePlacementToSingleValueProps
  }
  | {
    name: 'removeComponentIfWithinParent',
    args: RemoveComponentIfWithinParentOptions
  }
  | {
    name: 'addCommentToElement',
    args: AddCommentToElementOptions
  }
  | {
    name: 'commentIfParentCollectionNotDetected',
    args: {}
  }
  | {
    name: 'updateAvatarSize',
    args: {}
  }
  | {
    name: 'updateLegacyLink',
    args: {}
  }
  | {
    name: 'addColumnsPropToRow',
    args: {}
  }
  | {
    name: 'updateRowFunctionArg',
    args: {}
  }
  | {
    name: 'updateKeyToId',
    args: {}
  }
  | {
    name: 'updateDialogChild',
    args: {}
  }
  | {
    name: 'updateActionGroup',
    args: {}
  } | {
    name: 'commentIfNestedColumns',
    args: {}
  } | {
    name: 'addRowHeader',
    args: {}
  }

type Change = {
  description: string,
  reason: string,
  function: FunctionInfo
};

type ComponentChanges = {
  changes: Change[]
};

type ChangesJSON = {
  [component: string]: ComponentChanges
};

export const changes: ChangesJSON = {
  Avatar: {
    changes: [
      {
        description: 'Comment out isDisabled',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'isDisabled'}
        }
      },
      {
        description: 'Update size prop',
        reason: 'Updated naming convention',
        function: {
          name: 'updateAvatarSize',
          args: {}
        }
      }
    ]
  },
  ActionGroup: {
    changes: [
      {
        description: 'Comment out overflowMode',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'overflowMode'}
        }
      },
      {
        description: 'Comment out buttonLabelBehavior',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'buttonLabelBehavior'}
        }
      },
      {
        description: 'Comment out summaryIcon',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'summaryIcon'}
        }
      },
      {
        description: 'Replace with ActionButtonGroup or ToggleButtonGroup',
        reason: 'The API has changed',
        function: {name: 'updateActionGroup', args: {}}
      }
    ]
  },
  ActionMenu: {
    changes: [
      {
        description: 'Comment out closeOnSelect',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'closeOnSelect'}
        }
      },
      {
        description: 'Comment out trigger',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'trigger'}
        }
      }
    ]
  },
  Badge: {
    changes: [
      {
        description: "Change variant='info' to variant='informative'",
        reason: 'Updated naming convention',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'info',
            newProp: 'variant',
            newValue: 'informative'
          }
        }
      }
    ]
  },
  Breadcrumbs: {
    changes: [
      {
        description: 'Comment out showRoot',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'showRoot'}
        }
      },
      {
        description: 'Comment out isMultiline',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'isMultiline'}
        }
      },
      {
        description: 'Comment out autoFocusCurrent',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'autoFocusCurrent'}
        }
      },
      {
        description: 'Remove size="S"',
        reason: 'Small is no longer a supported size in Spectrum 2',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'size', propValue: 'S'}
        }
      },
      {
        description: 'Add comment to wrap in nav element if needed',
        reason: 'A nav element is no longer included inside Breadcrumbs by default. You can wrap the Breadcrumbs component in a nav element if needed.',
        function: {
          name: 'addCommentToElement',
          args: {comment: 'S2 Breadcrumbs no longer includes a nav element by default. You can wrap the Breadcrumbs component in a nav element if needed.'}
        }
      }
    ]
  },
  Button: {
    changes: [
      {
        description: 'Change variant="cta" to variant="accent"',
        reason: 'Call-to-action was deprecated',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'cta',
            newProp: 'variant',
            newValue: 'accent'
          }
        }
      },
      {
        description:
          'Change variant="overBackground" to variant="primary" staticColor="white"',
        reason: 'Updated design guidelines',
        function: {
          name: 'updatePropValueAndAddNewProp',
          args: {
            oldProp: 'variant',
            oldValue: 'overBackground',
            newProp: 'variant',
            newValue: 'primary',
            additionalProp: 'staticColor',
            additionalValue: 'white'
          }
        }
      },
      {
        description: 'Change style to fillStyle',
        reason: 'To avoid confusion with HTMLElement style attribute',
        function: {
          name: 'updatePropName',
          args: {oldProp: 'style', newProp: 'fillStyle'}
        }
      },
      {
        description: 'Comment out isPending',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'isPending'}
        }
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description:
          'If href is present, Button should be converted to a LinkButton',
        reason: 'Improved API and behavior for links',
        function: {
          name: 'updateComponentIfPropPresent',
          args: {
            newComponent: 'LinkButton',
            propToCheck: 'href'
          }
        }
      },
      {
        description: 'Remove elementType',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'elementType'}}
      }
    ]
  },
  CheckboxGroup: {
    changes: [
      {
        description: 'Remove showErrorIcon',
        reason: 'It has been removed for accessibility reasons',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'showErrorIcon'}
        }
      }
    ]
  },
  ColorArea: {
    changes: []
  },
  ColorWheel: {
    changes: []
  },
  ColorSlider: {
    changes: [
      {
        description: 'Remove showValueLabel',
        reason: 'It has been removed for accessibility reasons',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'showValueLabel'}
        }
      }
    ]
  },
  ColorField: {
    changes: [
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'isQuiet'}
        }
      },
      {
        description: 'Remove placeholder',
        reason: 'It has been removed for accessibility reasons',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'placeholder'}
        }
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  ComboBox: {
    changes: [
      {
        description:
          'Change menuWidth value from a DimensionValue to a pixel value',
        reason: 'Updated design guidelines',
        function: {
          name: 'convertDimensionValueToPx',
          args: {
            propToConvertValue: 'menuWidth'
          }
        }
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: 'Comment out loadingState',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'loadingState'}
        }
      },
      {
        description: 'Remove placeholder',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'placeholder'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      },
      {
        description: 'Comment out onLoadMore',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'onLoadMore'}
        }
      }
    ]
  },
  Dialog: {
    changes: []
  },
  DialogTrigger: {
    changes: [
      {
        description: "Comment out type='tray'",
        reason: 'Tray has not been implemented yet',
        function: {name: 'commentOutProp', args: {propToComment: 'type', propValue: 'tray'}}
      },
      {
        description: "Comment out mobileType='tray'",
        reason: 'mobileType has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'mobileType'}
        }
      },
      {
        description: 'Remove targetRef',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'targetRef'}}
      },
      {
        description:
          'Update children to move render props from being the second child of DialogTrigger to being a child of Dialog',
        reason: 'Updated API',
        function: {
          name: 'moveRenderPropsToChild',
          args: {newChildComponent: 'Dialog'}
        }
      },
      {
        description: 'Rename isDismissable to isDismissible',
        reason: 'Fixed spelling',
        function: {name: 'updatePropName', args: {oldProp: 'isDismissable', newProp: 'isDismissible'}}
      },
      {
        description: 'Update Dialog child to Popover or FullscreenDialog depending on type prop',
        reason: 'Updated API',
        function: {name: 'updateDialogChild', args: {}}
      }
    ]
  },
  DialogContainer: {
    changes: [
      {
        description: 'Rename isDismissable to isDismissible',
        reason: 'Fixed spelling',
        function: {name: 'updatePropName', args: {oldProp: 'isDismissable', newProp: 'isDismissible'}}
      },
      {
        description: 'Update Dialog child to Popover or FullscreenDialog depending on type prop',
        reason: 'Updated API',
        function: {name: 'updateDialogChild', args: {}}
      }
    ]
  },
  Divider: {
    changes: [
      {
        description: 'Remove Divider if within a Dialog',
        reason: 'Updated design',
        function: {
          name: 'removeComponentIfWithinParent',
          args: {parentComponent: 'Dialog'}
        }
      }
    ]
  },
  Form: {
    changes: [
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: 'Remove isReadOnly',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isReadOnly'}}
      },
      {
        description: 'Remove validationState',
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState'}
        }
      }
    ]
  },
  InlineAlert: {
    changes: [
      {
        description: "Change variant='info' to variant='informative'",
        reason: 'Updated naming convention',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'info',
            newProp: 'variant',
            newValue: 'informative'
          }
        }
      }
    ]
  },
  Item: {
    changes: [
      {
        description: 'If within Menu, update Item to be a MenuItem',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'Menu',
            newComponent: 'MenuItem'
          }
        }
      },
      {
        description: 'If within ActionMenu, update Item to be a MenuItem',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'ActionMenu',
            newComponent: 'MenuItem'
          }
        }
      },
      {
        description: 'If within TagGroup, update Item to be a Tag',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'TagGroup',
            newComponent: 'Tag'
          }
        }
      },
      {
        description: 'If within Breadcrumbs, update Item to be a Breadcrumb',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'Breadcrumbs',
            newComponent: 'Breadcrumb'
          }
        }
      },
      {
        description: 'If within Picker, update Item to be a PickerItem',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'Picker',
            newComponent: 'PickerItem'
          }
        }
      },
      {
        description: 'If within ComboBox, update Item to be a ComboBoxItem',
        reason: 'Updated collections API',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'ComboBox',
            newComponent: 'ComboBoxItem'
          }
        }
      },
      {
        description: 'Leave comment if we cannot determine parent collection component',
        reason: 'No collection parent detected',
        function: {
          name: 'commentIfParentCollectionNotDetected',
          args: {}
        }
      }
      // TODO: Not yet implemented in S2
      // {
      //   description: 'If within ListBox, update Item to be a ListBoxItem',
      //   reason: 'Updated collections API',
      //   function: {
      //     name: 'updateComponentWithinCollection',
      //     args: {
      //       parentComponent: 'ListBox',
      //       newComponent: 'ListBoxItem'
      //     }
      //   }
      // },
    ]
  },
  Link: {
    changes: [
      {
        description: "Change variant='overBackground' to staticColor='white'",
        reason: 'Updated design guidelines',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'overBackground',
            newProp: 'staticColor',
            newValue: 'white'
          }
        }
      },
      {
        description: 'Remove inner anchor element if used (legacy API)',
        reason: 'Updated API',
        function: {
          name: 'updateLegacyLink',
          args: {}
        }
      }
    ]
  },
  MenuTrigger: {
    changes: [
      {
        description: 'Comment out closeOnSelect',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'closeOnSelect'}
        }
      }
    ]
  },
  SubmenuTrigger: {
    changes: [
      {
        description: 'Remove targetKey',
        reason: 'Potential v3 bug or API differ bug',
        function: {name: 'removeProp', args: {propToRemove: 'targetKey'}}
      }
    ]
  },
  NumberField: {
    changes: [
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  Picker: {
    changes: [
      {
        description:
          'Change menuWidth value from a DimensionValue to a pixel value',
        reason: 'Updated design guidelines',
        function: {
          name: 'convertDimensionValueToPx',
          args: {
            propToConvertValue: 'menuWidth'
          }
        }
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      },
      {
        description: 'Comment out isLoading',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'isLoading'}
        }
      },
      {
        description: 'Comment out onLoadMore',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'onLoadMore'}
        }
      }
    ]
  },
  ProgressBar: {
    changes: [
      {
        description: "Change variant='overBackground' to staticColor='white'",
        reason: 'Updated design guidelines',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'overBackground',
            newProp: 'staticColor',
            newValue: 'white'
          }
        }
      },
      {
        description: 'Comment out labelPosition',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'labelPosition'}
        }
      },
      {
        description: 'Remove showValueLabel',
        reason: 'It was removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'showValueLabel'}}
      }
    ]
  },
  ProgressCircle: {
    changes: [
      {
        description: "Change variant='overBackground' to staticColor='white'",
        reason: 'Updated design guidelines',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'overBackground',
            newProp: 'staticColor',
            newValue: 'white'
          }
        }
      }
    ]
  },
  RadioGroup: {
    changes: [
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      },
      {
        description: 'Remove showErrorIcon',
        reason: 'It has been removed for accessibility reasons',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'showErrorIcon'}
        }
      }
    ]
  },
  RangeSlider: {
    changes: [
      {
        description: 'Remove showValueLabel',
        reason: 'It was removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'showValueLabel'}}
      },
      {
        description: 'Comment out getValueLabel',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'getValueLabel'}
        }
      },
      {
        description: 'Comment out orientation',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'orientation'}
        }
      }
    ]
  },
  SearchField: {
    changes: [
      {
        description: 'Remove placeholder',
        reason: 'It has been removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'placeholder'}}
      },
      {
        description: 'Comment out icon',
        reason: 'It has not been implemented yet',
        function: {name: 'commentOutProp', args: {propToComment: 'icon'}}
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  Section: {
    changes: [
      {
        description: 'If within Menu, update Section to be a MenuSection',
        reason: 'Updated component structure',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'Menu',
            newComponent: 'MenuSection'
          }
        }
      },
      {
        description: 'If within Picker, update Section to be a PickerSection',
        reason: 'Updated component structure',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'Picker',
            newComponent: 'PickerSection'
          }
        }
      },
      {
        description: 'If within ComboBox, update Section to be a ComboBoxSection',
        reason: 'Updated component structure',
        function: {
          name: 'updateComponentWithinCollection',
          args: {
            parentComponent: 'ComboBox',
            newComponent: 'ComboBoxSection'
          }
        }
      },
      {
        description:
          'Move title prop string to be a child of new Heading within a Header',
        reason: 'Updated API',
        function: {
          name: 'movePropToNewChildComponent',
          args: {
            parentComponent: 'Menu',
            childComponent: 'MenuSection',
            propToMove: 'title',
            newChildComponent: 'Header'
          }
        }
      },
      {
        description:
          'Move title prop string to be a child of new Heading within a Header',
        reason: 'Updated API',
        function: {
          name: 'movePropToNewChildComponent',
          args: {
            parentComponent: 'Picker',
            childComponent: 'PickerSection',
            propToMove: 'title',
            newChildComponent: 'Header'
          }
        }
      },
      {
        description:
          'Move title prop string to be a child of new Heading within a Header',
        reason: 'Updated API',
        function: {
          name: 'movePropToNewChildComponent',
          args: {
            parentComponent: 'ComboBox',
            childComponent: 'ComboBoxSection',
            propToMove: 'title',
            newChildComponent: 'Header'
          }
        }
      },
      {
        description: 'Leave comment if we cannot determine parent collection component',
        reason: 'No collection parent detected',
        function: {
          name: 'commentIfParentCollectionNotDetected',
          args: {}
        }
      }
    ]
  },
  Slider: {
    changes: [
      {
        description: 'Remove isFilled',
        reason: 'Slider is always filled in Spectrum 2',
        function: {name: 'removeProp', args: {propToRemove: 'isFilled'}}
      },
      {
        description: 'Remove trackGradient',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'trackGradient'}}
      },
      {
        description: 'Remove showValueLabel',
        reason: 'It was removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'showValueLabel'}}
      },
      {
        description: 'Comment out getValueLabel',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'getValueLabel'}
        }
      },
      {
        description: 'Comment out orientation',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'orientation'}
        }
      }
    ]
  },
  StatusLight: {
    changes: [
      {
        description: 'Remove isDisabled',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isDisabled'}}
      },
      {
        description: "Change variant='info' to variant='informative'",
        reason: 'Updated naming convention',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'variant',
            oldValue: 'info',
            newProp: 'variant',
            newValue: 'informative'
          }
        }
      }
    ]
  },
  Tabs: {
    changes: [
      {
        description: 'Remove TabPanels components and keep individual TabPanel components inside.',
        reason: 'Updated collections API',
        function: {
          name: 'updateTabs',
          args: {}
        }
      },
      {
        description: 'Remove isEmphasized',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isEmphasized'}}
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      }
    ]
  },
  TagGroup: {
    changes: [
      {
        description: 'Change actionLabel to groupActionLabel',
        reason: 'To match new onGroupAction prop',
        function: {
          name: 'updatePropName',
          args: {oldProp: 'actionLabel', newProp: 'groupActionLabel'}
        }
      },
      {
        description: 'Change onAction to onGroupAction',
        reason: 'To avoid confusion with existing onAction prop on other collection components',
        function: {
          name: 'updatePropName',
          args: {oldProp: 'onAction', newProp: 'onGroupAction'}
        }
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  TextArea: {
    changes: [
      {
        description: 'Comment out icon',
        reason: 'It has not been implemented yet',
        function: {name: 'commentOutProp', args: {propToComment: 'icon'}}
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: 'Remove placeholder',
        reason: 'It has been removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'placeholder'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  TextField: {
    changes: [
      {
        description: 'Comment out icon',
        reason: 'It has not been implemented yet',
        function: {name: 'commentOutProp', args: {propToComment: 'icon'}}
      },
      {
        description: 'Remove isQuiet',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'isQuiet'}}
      },
      {
        description: 'Remove placeholder',
        reason: 'It has been removed for accessibility reasons',
        function: {name: 'removeProp', args: {propToRemove: 'placeholder'}}
      },
      {
        description: "Change validationState='invalid' to isInvalid",
        reason: 'Updated API',
        function: {
          name: 'updatePropNameAndValue',
          args: {
            oldProp: 'validationState',
            oldValue: 'invalid',
            newProp: 'isInvalid',
            newValue: true
          }
        }
      },
      {
        description: "Remove validationState='valid'",
        reason: 'It is no longer supported',
        function: {
          name: 'removeProp',
          args: {propToRemove: 'validationState', propValue: 'valid'}
        }
      }
    ]
  },
  Tooltip: {
    changes: [
      {
        description: 'Remove variant',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'variant'}}
      },
      {
        description:
          'Remove placement and add to the parent TooltipTrigger instead',
        reason: 'Updated API',
        function: {
          name: 'movePropToParentComponent',
          args: {
            parentComponent: 'TooltipTrigger',
            childComponent: 'Tooltip',
            propToMove: 'placement'
          }
        }
      },
      {
        description: 'Remove showIcon',
        reason: 'It is no longer supported',
        function: {name: 'removeProp', args: {propToRemove: 'showIcon'}}
      },
      {
        description:
          'Remove isOpen and add to the parent TooltipTrigger instead',
        reason: 'Updated API',
        function: {
          name: 'movePropToParentComponent',
          args: {
            parentComponent: 'TooltipTrigger',
            childComponent: 'Tooltip',
            propToMove: 'isOpen'
          }
        }
      }
    ]
  },
  TooltipTrigger: {
    changes: [
      {
        description: 'Update placement to use single value',
        reason: 'Updated API',
        function: {
          name: 'updatePlacementToSingleValue',
          args: {
            propToUpdate: 'placement',
            childComponent: 'Tooltip'
          }
        }
      }
    ]
  },
  TableView: {
    changes: [
      {
        description: 'Add columns prop to Row',
        reason: 'Rows now require a columns prop from TableHeader',
        function: {
          name: 'addColumnsPropToRow',
          args: {}
        }
      },
      {
        description: 'Leave comment if nested columns are used',
        reason: 'Nested columns are not supported yet',
        function: {
          name: 'commentIfNestedColumns',
          args: {}
        }
      },
      {
        description: 'Comment out dragAndDropHooks',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'dragAndDropHooks'}
        }
      },
      {
        description: 'Comment out selectionStyle="highlight"',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'selectionStyle'}
        }
      },
      {
        description: 'Comment out UNSTABLE_allowsExpandableRows',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'UNSTABLE_allowsExpandableRows'}
        }
      },
      {
        description: 'Comment out UNSTABLE_defaultExpandedKeys',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'UNSTABLE_defaultExpandedKeys'}
        }
      },
      {
        description: 'Comment out UNSTABLE_expandedKeys',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'UNSTABLE_expandedKeys'}
        }
      },
      {
        description: 'Comment out UNSTABLE_onExpandedChange',
        reason: 'It has not been implemented yet',
        function: {
          name: 'commentOutProp',
          args: {propToComment: 'UNSTABLE_onExpandedChange'}
        }
      },
      {
        description: 'Add isRowHeader prop to fist Column if one doesn\'t eixst already',
        reason: 'Updated API',
        function: {
          name: 'addRowHeader',
          args: {}
        }
      }
    ]
  },
  Column: {
    changes: [
      {
        description: 'Update key prop to id',
        reason: 'Updated API',
        function: {
          name: 'updateKeyToId',
          args: {}
        }
      }
    ]
  },
  Row: {
    changes: [
      {
        description: 'Update key prop to id',
        reason: 'Updated API',
        function: {
          name: 'updateKeyToId',
          args: {}
        }
      },
      {
        description: 'Update child function to receive column object instead of column key',
        reason: 'Updated API',
        function: {
          name: 'updateRowFunctionArg',
          args: {}
        }
      }
    ]
  }
};
