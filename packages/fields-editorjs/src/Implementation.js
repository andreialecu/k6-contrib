import { Text } from '@keystonejs/fields';

export class EditorJsImplementation extends Text.implementation {
  constructor(path, { editorConfig }) {
    super(...arguments);
    this.editorConfig = editorConfig;
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      editorConfig: this.editorConfig,
    };
  }
}
