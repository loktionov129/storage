export class ReducersUtils {
  public static filterEntity(entity, terms) {
    for (let key in terms) {
      if (terms.hasOwnProperty(key)) {
        const value = CommonUtils.getObjectProperty(key, entity);
        if (value != terms[key]) {
          return false;
        }
      }
    }
    return true;
  }
}
