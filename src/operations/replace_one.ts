import { OperationBase } from './operation';
import { updateDocuments } from './common_functions';
import { hasAtomicOperators } from '../utils';

class ReplaceOneOperation extends OperationBase {
  collection: any;
  filter: any;
  replacement: any;

  constructor(collection: any, filter: any, replacement: any, options: any) {
    super(options);

    if (hasAtomicOperators(replacement)) {
      throw new TypeError('Replacement document must not contain atomic operators');
    }

    this.collection = collection;
    this.filter = filter;
    this.replacement = replacement;
  }

  execute(callback: Function) {
    const coll = this.collection;
    const filter = this.filter;
    const replacement = this.replacement;
    const options = this.options;

    // Set single document update
    options.multi = false;

    // Execute update
    updateDocuments(coll, filter, replacement, options, (err: Error, r: any) =>
      replaceCallback(err, r, replacement, callback)
    );
  }
}

function replaceCallback(err: any, r: any, doc: any, callback: Function) {
  if (callback == null) return;
  if (err && callback) return callback(err);
  if (r == null) return callback(null, { result: { ok: 1 } });

  r.modifiedCount = r.result.nModified != null ? r.result.nModified : r.result.n;
  r.upsertedId =
    Array.isArray(r.result.upserted) && r.result.upserted.length > 0
      ? r.result.upserted[0] // FIXME(major): should be `r.result.upserted[0]._id`
      : null;
  r.upsertedCount =
    Array.isArray(r.result.upserted) && r.result.upserted.length ? r.result.upserted.length : 0;
  r.matchedCount =
    Array.isArray(r.result.upserted) && r.result.upserted.length > 0 ? 0 : r.result.n;
  r.ops = [doc]; // TODO: Should we still have this?
  if (callback) callback(null, r);
}

export = ReplaceOneOperation;
