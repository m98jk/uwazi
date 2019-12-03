/** @format */

import RouteHandler from 'app/App/RouteHandler';
import EntitiesAPI from 'app/Entities/EntitiesAPI';
import PDFView from './PDFView';
import EntityView from './EntityView';
import ViewerComponent from './components/ViewerComponent';
import React from 'react';
import { actions as formActions } from 'react-redux-form';
import { actions } from 'app/BasicReducer';
import { setReferences } from './actions/referencesActions';
import * as relationships from 'app/Relationships/utils/routeUtils';

class ViewerRoute extends RouteHandler {
  static async requestState(requestParams, globalResources) {
    const { sharedId } = requestParams.data;
    const [entity] = await EntitiesAPI.get(requestParams.set({ sharedId }));

    return entity.file
      ? PDFView.requestState(requestParams, globalResources)
      : EntityView.requestState(requestParams, globalResources);
  }

  emptyState() {
    this.context.store.dispatch(actions.unset('viewer/doc'));
    this.context.store.dispatch(actions.unset('viewer/templates'));
    this.context.store.dispatch(actions.unset('viewer/thesauris'));
    this.context.store.dispatch(actions.unset('viewer/relationTypes'));
    this.context.store.dispatch(actions.unset('viewer/rawText'));
    this.context.store.dispatch(formActions.reset('documentViewer.tocForm'));
    this.context.store.dispatch(actions.unset('viewer/targetDoc'));
    this.context.store.dispatch(setReferences([]));
    this.context.store.dispatch(actions.unset('entityView/entity'));
    this.context.store.dispatch(relationships.emptyState());
  }

  render() {
    return <ViewerComponent {...this.props} />;
  }
}

ViewerRoute.defaultProps = {
  params: {},
};

export default ViewerRoute;
