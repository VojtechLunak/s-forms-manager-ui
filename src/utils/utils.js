import {Constants, FormUtils, JsonLdFramingUtils, JsonLdObjectMap, JsonLdObjectUtils} from "s-forms";
import * as jsonld from "jsonld";

export default async function _constructFormQuestions(structure, intl) {
    let form;
    let formElements;
    let id2ObjectMap;
    let formQuestions = [];

    structure = await jsonld.flatten(structure, {});

    if (structure["@graph"][0]["@id"] !== undefined) {
        id2ObjectMap = JsonLdFramingUtils.expandStructure(structure); //TODO make as callback

        Object.keys(id2ObjectMap).map((key) => {
            JsonLdObjectMap.putObject(key, id2ObjectMap[key]);
        });
    } else {
        console.warn("default form is constructed.");
    }

    form = structure["@graph"].find((item) => FormUtils.isForm(item));
    formElements = form[Constants.HAS_SUBQUESTION];

    if (!formElements) {
        throw "No questions in the form";
    }

    formQuestions = formElements.filter((item) => {
        if (FormUtils.isWizardStep(item) && !FormUtils.isHidden(item)) {
            return true;
        }

        return false;
    });

    if (!formQuestions.length) {
        form[Constants.HAS_SUBQUESTION].forEach((question) =>
            formQuestions.push(question)
        );
    }

    // sort by label - different to SForms as the sort was not deterministic for leaf questions
   sortQuestionsRecursively(formQuestions, intl);

    // sort by property
    JsonLdObjectUtils.orderPreservingToplogicalSort(
        formQuestions,
        Constants.HAS_PRECEDING_QUESTION
    );

    return [formQuestions, {root: form}];
}

function sortQuestionsRecursively(questions, intl) {
    questions.sort(JsonLdObjectUtils.getCompareLocalizedLabelFunction(intl));
    questions.forEach((question) => {
        if (question[Constants.HAS_SUBQUESTION]) {
            sortQuestionsRecursively(question[Constants.HAS_SUBQUESTION], intl);
        }
    });
}

function isAnswer(node) {
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    return types.includes("doc:answer");
}

function updateIdsRecursively(node, idToOriginMap) {
    if (Array.isArray(node)) {
        return node.map((item) => {
            if (typeof item === "string" && idToOriginMap[item]) {
                // Replace the value if it matches an ID in the map
                return idToOriginMap[item];
            }
            return updateIdsRecursively(item, idToOriginMap);
        });
    } else if (typeof node === "object" && node !== null) {
        const updatedNode = { ...node };
        Object.keys(updatedNode).forEach((key) => {
            const value = updatedNode[key];
            if (typeof value === "string" && idToOriginMap[value]) {
                updatedNode[key] = idToOriginMap[value];
            } else {
                updatedNode[key] = updateIdsRecursively(value, idToOriginMap);
            }
        });
        return updatedNode;
    }
    return node;
}

export function extractFormTemplateFromFormData(fullJsonld) {
    const graph = fullJsonld["@graph"];
    if (!graph) {
        console.warn("No @graph in input");
        return null;
    }

    // Filter out answer nodes
    let filteredGraph = graph
        .filter((node) => !isAnswer(node))
        .map((node) => {
            const cleaned = { ...node };
            // 2. Remove hasAnswer (or any other answer-linking props)
            delete cleaned["has_answer"];
            delete cleaned["http://onto.fel.cvut.cz/ontologies/form/has_answer"];
            delete cleaned["has-origin-path-id"];
            delete cleaned["http://onto.fel.cvut.cz/ontologies/form/has-origin-path-id"];
            return cleaned;
        });

    const idToOriginMap = {};
    filteredGraph.forEach((node) => {
        if (node["has-question-origin"]) {
            const qOrigin = node["has-question-origin"];
            let newOrigin = String(qOrigin);
            newOrigin = newOrigin.replace(/-qo$/, '');
            if (qOrigin === newOrigin) {
                newOrigin = qOrigin + "-" + Date.now().toString().slice(-4);
            }
            idToOriginMap[node["@id"]] = newOrigin;
        }
    });

    filteredGraph = filteredGraph.map((node) => updateIdsRecursively(node, idToOriginMap));

    // Reassign "has-question-origin" to @id in all nodes
    filteredGraph = filteredGraph.map((node => {
        node = { ...node };
        if(node["has-question-origin"]) {
            const qOrigin = node["has-question-origin"];
            node["@id"] = idToOriginMap[qOrigin] || node["@id"];
        }
        return node;
    }));

    return {
        "@context": fullJsonld["@context"],
        "@graph": filteredGraph,
    };
}

export async function flattenJsonLdStructure(input) {
    const flattened = await jsonld.flatten(input);

    const formTemplateNode = flattened.find((node) => {
        const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
        return types.includes("http://onto.fel.cvut.cz/ontologies/form/form-template");
    })

    return {
        "@id": formTemplateNode["@id"],
        "@graph": flattened
    };
}

