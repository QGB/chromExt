/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global chrome */

var browser = window.browser || chrome;

(function ($) {
    var initPanel = function () {
        initElements();
        bindEvents();

        var onElementSelected = function () {
            getSelectedElement(function (result) {
                if (!result) {
                    return;
                }

                window.selectedElement = result;
                window.selectedElementInfo = AdguardRulesConstructorLib.getElementInfo(result);

                updateRule();
                handleShowBlockSettings(window.selectedElementInfo.haveUrlBlockParameter, window.selectedElementInfo.haveClassAttribute);
                setupAttributesInfo(window.selectedElementInfo);
            });
        };

        var onPageChanged = function () {
            document.getElementById("preview-rule-button").value = 'Preview';
            delete window.adguardDevToolsPreview;
        };

        browser.devtools && browser.devtools.panels.elements.onSelectionChanged.addListener(onElementSelected);
        browser.devtools && browser.devtools.network.onNavigated.addListener(onPageChanged);

        onElementSelected();
    };

    var initElements = function () {
        $('#block-by-url-checkbox').get(0).checked = false;
        $('#block-similar-checkbox').get(0).checked = false;
        $('#one-domain-checkbox').get(0).checked = true;

        $("#filter-rule-text").get(0).value = '';

        var placeholder = document.getElementById("attributes-block");
        while (placeholder.firstChild) {
            placeholder.removeChild(placeholder.firstChild);
        }
    };

    var updateRule = function () {
        getInspectedPageUrl(function(res) {
            updateFilterRuleInput(window.selectedElement, window.selectedElementInfo, res);
        });
    };

    var bindEvents = function () {
        var previewRuleButton = document.getElementById("preview-rule-button");
        previewRuleButton.addEventListener("click", function (e) {
            e.preventDefault();

            if (window.selectedElement) {
                if (window.adguardDevToolsPreview) {
                    // Remove preview
                    cancelPreview();
                    previewRuleButton.value = 'Preview';

                    delete window.adguardDevToolsPreview;
                    return;
                }

                var ruleText = document.getElementById("filter-rule-text").value;
                applyPreview(ruleText);

                previewRuleButton.value = 'Cancel preview';

                window.adguardDevToolsPreview = window.selectedElement;
            }
        });

        document.getElementById("add-rule-button").addEventListener("click", function (e) {
            e.preventDefault();

            if (window.selectedElement) {
                addRuleForElement(window.selectedElement);
            }
        });

        $('.update-rule-block').on('click', function () {
            updatePanelElements();
            updateRule();
        });
    };

    var getSelectedElement = function (callback) {
        /**
         * Only serializable data can be passed in callback function
         */
        var serializeElement = function (node) {
            if (!node || !node.tagName) {
                return '';
            }

            if (node.outerHTML) {
                return node.outerHTML;
            }

            // polyfill:
            var wrapper = document.createElement('div');
            wrapper.appendChild(node.cloneNode(true));
            return wrapper.innerHTML;
        };

        var deserializeElement = function (html) {
            var wrapper = document.createElement('div');

            if (html) {
                if (html.startsWith('<body') || html.startsWith('<BODY')) {
                    wrapper = document.createElement('body');
                    wrapper.innerHTML = html;
                    return wrapper;
                }

                if (html.startsWith('<html') || html.startsWith('<HTML')) {
                    wrapper = document.createElement('html');
                    wrapper.innerHTML = html;
                    return wrapper;
                }

                if (html.startsWith('<head') || html.startsWith('<HEAD')) {
                    wrapper = document.createElement('head');
                    wrapper.innerHTML = html;
                    return wrapper;
                }
            }

            wrapper.innerHTML = html;
            return wrapper.firstChild;
        };

        browser.devtools.inspectedWindow.eval("(" + serializeElement.toString() + ")($0)", function (result) {
            callback(deserializeElement(result));
        });
    };

    var updatePanelElements = function () {
        var checkboxes = $('#one-domain-checkbox, #block-similar-checkbox, .attribute-check-box');

        //All checkboxes should be disabled if block by url is checked
        if ($('#block-by-url-checkbox').get(0).checked == true) {
            checkboxes.attr("disabled", "disabled");
        } else {
            checkboxes.removeAttr("disabled");
        }
    };

    var handleShowBlockSettings = function (showBlockByUrl, showBlockSimilar) {
        if (showBlockByUrl) {
            $('#block-by-url-checkbox-block').show();
        } else {
            $('#block-by-url-checkbox').get(0).checked = false;
            $('#block-by-url-checkbox-block').hide();
        }
        if (showBlockSimilar) {
            $('#block-similar-checkbox-block').show();
            $('#block-similar-checkbox').get(0).checked = false;
        } else {
            $('#block-similar-checkbox').get(0).checked = true;
            $('#block-similar-checkbox-block').hide();
        }
    };

    var setupAttributesInfo = function (info) {
        var placeholder = document.getElementById("attributes-block");
        while (placeholder.firstChild) {
            placeholder.removeChild(placeholder.firstChild);
        }

        var createAttributeElement = function(attributeName, attributeValue, defaultChecked) {
            var checked = '';
            if (defaultChecked) {
                checked = '" checked="true"';
            }

            var el = $(
                '<li class="parent">'
                + '<input class="enabled-button attribute-check-box" type="checkbox" id="' + 'attribute-check-box-' + attributeName + checked + '">'
                + '<span class="webkit-css-property">' + attributeName + '</span>: '
                + '<span class="value attribute-check-box-value">' + attributeValue + '</span>'
                + '</li>');
            return el.get(0);
        };

        placeholder.appendChild(createAttributeElement('tag', info.tagName.toLowerCase(), true));

        for (var i = 0; i < info.attributes.length; i++) {
            var attribute = info.attributes[i];

            if ((attribute.name == 'class') && (attribute.value)) {
                var split = attribute.value.split(' ');
                for (var j = 0; j < split.length; j++) {
                    placeholder.appendChild(createAttributeElement(attribute.name, split[j], true));
                }
            } else {
                placeholder.appendChild(createAttributeElement(attribute.name, attribute.value, attribute.name == 'id'));
            }
        }

    };

    var getInspectedPageUrl = function (callback) {
        browser.devtools.inspectedWindow.eval("document.location && document.location.href", function (result) {
            callback(result);
        });
    };

    var updateFilterRuleInput = function (element, info, url) {
        var isBlockByUrl = $('#block-by-url-checkbox').get(0).checked;
        var isBlockSimilar = $("#block-similar-checkbox").get(0).checked;
        var isBlockOneDomain = $("#one-domain-checkbox").get(0).checked;

        var includeTagName = true;
        var includeElementId = true;
        var selectedClasses = [];
        var attributesSelector = '';
        $('.attribute-check-box').forEach(function (el) {
            if (el) {
                var attrName = el.id.substring('attribute-check-box-'.length);
                if (attrName == 'tag') {
                    includeTagName = el.checked;
                } else if (attrName == 'id') {
                    includeElementId = el.checked;
                } else {
                    if (el.checked && info.attributes) {
                        var attr = info.attributes[attrName];
                        if (attr) {
                            if (attrName == 'class') {
                                var className = el.parentNode.querySelector('.attribute-check-box-value').innerText;
                                selectedClasses.push('.' + className);
                            } else {
                                attributesSelector += '[' + attr.name + '="' + attr.value + '"]';
                            }
                        }
                    }
                }
            }
        });

        var options = {
            isBlockByUrl: isBlockByUrl,
            urlMask: info.urlBlockAttributeValue,
            isBlockSimilar : !isBlockSimilar,
            isBlockOneDomain: !isBlockOneDomain,
            url: url,
            attributes: attributesSelector,
            excludeTagName: !includeTagName,
            excludeId: !includeElementId,
            classesSelector: selectedClasses.join('')
        };

        var func = 'AdguardRulesConstructorLib.constructRuleText($0, ' + JSON.stringify(options) + ');';
        browser.devtools.inspectedWindow.eval(func, {
            useContentScriptContext: true
        }, function (result) {
            if (result) {
                document.getElementById("filter-rule-text").value = result;
            }
        });
    };

    var applyPreview = function (ruleText) {
        togglePreview(ruleText);
    };

    var cancelPreview = function () {
        togglePreview();
    };

    var togglePreview = function (ruleText) {

        var togglePreviewStyle = function (ruleText) {
            var PREVIEW_STYLE_ID = "adguard-preview-style";

            var head = document.getElementsByTagName('head')[0];
            if (head) {
                if (ruleText && ruleText != 'undefined') {
                    var selector = AdguardRulesConstructorLib.constructRuleCssSelector(ruleText);
                    if (!selector) {
                        return;
                    }

                    var style = document.createElement("style");
                    style.setAttribute("type", "text/css");
                    style.setAttribute("id", PREVIEW_STYLE_ID);
                    style.appendChild(document.createTextNode(selector + " {display: none !important;}"));

                    head.appendChild(style);
                } else {
                    head.removeChild(document.getElementById(PREVIEW_STYLE_ID));
                }
            }
        };

        browser.devtools.inspectedWindow.eval("(" + togglePreviewStyle.toString() + ")('" + ruleText + "')", { useContentScriptContext: true });
    };

    var addRuleForElement = function () {
        if (window.adguardDevToolsPreview) {
            // Remove preview
            cancelPreview();
        }

        var ruleText = document.getElementById("filter-rule-text").value;

        var addRule = function (ruleText) {
            contentPage.sendMessage({type: 'addUserRule', ruleText: ruleText});
        };

        browser.devtools.inspectedWindow.eval("(" + addRule.toString() + ")('" + ruleText + "')", {
            useContentScriptContext: true
        }, function () {
            applyPreview(ruleText);

            delete window.selectedElement;
            delete window.selectedElementInfo;

            initElements();
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initPanel();
    });

})(balalaika);


