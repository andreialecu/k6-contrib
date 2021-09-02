import path from 'path';

import {
  BaseGeneratedListTypes,
  fieldType,
  FieldTypeFunc,
  KeystoneContext,
  schema,
} from '@keystone-next/types';
import { DimensionData, DimensionFieldConfig, DimensionFieldInputType } from './types';

const views = path.join(
  path.dirname(require.resolve('@k6-contrib/fields-dimension/package.json')),
  'views'
);

const DimensionFieldInput = schema.inputObject({
  name: 'DimensionFieldInput',
  fields: {
    unit: schema.arg({ type: schema.nonNull(schema.String) }),
    length: schema.arg({ type: schema.nonNull(schema.Float) }),
    width: schema.arg({ type: schema.nonNull(schema.Float) }),
    height: schema.arg({ type: schema.nonNull(schema.Float) }),
  },
});

async function inputResolver(data: DimensionFieldInputType, context: KeystoneContext) {
  if (data === null || data === undefined) {
    return { unit: data, length: data, width: data, height: data };
  }

  return { ...data } as DimensionData;
}

const dimensionUnits = [
  { label: 'Inches', value: 'in' },
  { label: 'Feet', value: 'ft' },
  { label: 'Millimeter', value: 'mm' },
  { label: 'Centimeter', value: 'cm' },
  { label: 'Meter', value: 'm' },
];

const DimensionOutputFields = schema.fields<DimensionData>()({
  length: schema.field({ type: schema.nonNull(schema.Float) }),
  width: schema.field({ type: schema.nonNull(schema.Float) }),
  height: schema.field({ type: schema.nonNull(schema.Float) }),
  unit: schema.field({
    type: schema.enum({
      name: 'DimensionEnumType',
      values: schema.enumValues(dimensionUnits.map(u => u.value)),
    }),
  }),
});

const DimensionFieldOutput = schema.interface<DimensionData>()({
  name: 'DimensionFieldOutput',
  fields: DimensionOutputFields,
  resolveType: () => 'DimensionFieldOutputType',
});

const DimensionFieldOutputType = schema.object<DimensionData>()({
  name: 'DimensionFieldOutputType',
  interfaces: [DimensionFieldOutput],
  fields: DimensionOutputFields,
});

export const dimension =
  <TGeneratedListTypes extends BaseGeneratedListTypes>({
    isRequired,
    units = [],
    displayMode = 'select',
    defaultUnit = null,
    ...config
  }: DimensionFieldConfig<TGeneratedListTypes> = {}): FieldTypeFunc =>
  meta => {
    if ((config as any).isUnique) {
      throw Error('isUnique is not a supported option for field type dimension');
    }

    return fieldType({
      kind: 'multi',
      fields: {
        unit: { kind: 'scalar', scalar: 'String', mode: 'optional' },
        length: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
        width: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
        height: { kind: 'scalar', scalar: 'Float', mode: 'optional' },
      },
    })({
      ...config,
      getAdminMeta: () => ({
        units: dimensionUnits,
        displayMode,
        defaultUnit,
      }),
      input: {
        create: {
          arg: schema.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
        update: {
          arg: schema.arg({ type: DimensionFieldInput }),
          resolve: inputResolver,
        },
      },
      output: schema.field({
        type: DimensionFieldOutput,
        resolve({ value: { unit, length, width, height } }) {
          if (unit === null || length === null || width === null || height === null) {
            return null;
          }
          return { unit, length, width, height };
        },
      }),
      unreferencedConcreteInterfaceImplementations: [DimensionFieldOutputType],
      views,
      __legacy: {
        isRequired,
        defaultValue: null,
      },
    });
  };