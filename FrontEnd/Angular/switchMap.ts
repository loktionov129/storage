    this.rubrics$ = this.store.let(filterContactRubrics({'attributes.contact_id': this.contact.id}))
      .switchMap((contactRubrics: ContactRubric[]): Observable<Rubric[]> => {
        const ids: number[] = contactRubrics
          .map((contactRubric: ContactRubric) => contactRubric.attributes.rubric_id);
        return this.store.let(getRubrics(ids));
      });
