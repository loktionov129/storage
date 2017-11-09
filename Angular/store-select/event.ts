export function getEventsEntities() {
  return (state$: Observable<EventState>) => state$
    .map(state => state.ids.map(id => state.entities[id]));
}

export function filterEvent(terms: {}) {
  return (state$: Observable<EventState>) => state$
    .let(getEventsEntities())
    .map((entities) => {
      const filteredEntities = CommonUtils.filterObject(entities, (e) => ReducersUtils.filterEntity(e, terms));
      return CommonUtils.mapObject(filteredEntities, (x) => x);
    });
}
