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
