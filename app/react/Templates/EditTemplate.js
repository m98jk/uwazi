import React from 'react';

import templatesAPI from 'app/Templates/TemplatesAPI';
import thesaurisAPI from 'app/Thesauris/ThesaurisAPI';
import TemplateCreator from 'app/Templates/components/TemplateCreator';
import {setTemplate} from 'app/Templates/actions/templateActions';
import {setThesauris} from 'app/Templates/actions/uiActions';
import RouteHandler from 'app/controllers/App/RouteHandler';
import ID from 'app/utils/uniqueID';

let prepareTemplate = (template) => {
  template.properties = template.properties.map((property) => {
    property.localID = ID();
    return property;
  });

  return template;
};

export default class EditTemplate extends RouteHandler {

  static requestState({templateId}) {
    return Promise.all([
      templatesAPI.get(templateId),
      thesaurisAPI.get()
    ])
    .then(([templates, thesauris]) => {
      return {
        template: {
          data: prepareTemplate(templates[0]),
          uiState: {thesauris: thesauris}
        }
      };
    });
  }

  setReduxState({template}) {
    this.context.store.dispatch(setTemplate(template.data));
    this.context.store.dispatch(setThesauris(template.uiState.thesauris));
  }

  render() {
    return <TemplateCreator />;
  }

}

//when all components are integrated with redux we can remove this
EditTemplate.__redux = true;
