import utils from './utils';
import { Schema, Table, Column } from '../types';

/**
 * Class which holds helper tools when working with schema.
 *
 * @export
 */
export class SchemaUtil {

  /**
   * Get normalized schema by type
   * @param  schema - collection of tables
   * @param  type - data type normalized (E.g: User, Account)
   * @return  table from schema that matches type.
   */
  public getNormalizedTableByType(schema: Schema, type: string): Table | undefined {
    for (const table of schema) {
      /* istanbul ignore else */
      if (utils.toTitleCase(table.name) === type) {
        return table;
      }
    }

    return undefined;
  }

  /**
   * Convert values from COLUMN_TYPE column
   * @param  column - schema.
   * @return  converted column
   */
  public convertValues(column: Column): Column {
    const columnType: string = column.dataType.rawValues || '';

    switch (column.dataType.type) {
      case 'enum':
        column.dataType.values = columnType ?
          (columnType.substring(4)
            .replace(/["'()]/g, '')
            .replace(' ', '')
            .split(',')) : [];
        break;
      default:
        delete column.dataType.rawValues;
    }

    return column;
  }

  /**
   * Convert array of values to raml values
   * @param  values - ['Yes', 'No']
   * @return  - 'Yes | No'
   */
  public valuesToRamlDataType(values: string[]): string {
    return (values && values.length > 0) ? values.join(' | ') : '';
  }

  /**
   * Checks if a circular reference exists between the source and target table.
   *
   * @param  source - source table
   * @param  column - column which references another table
   * @param  schema - whole schema
   * @return  true if a circular reference exists in the target table
   */
  public isCircularRelation(source: Table, column: Column, schema: Schema): boolean {
    const target: Table | undefined = schema.find(
      (table: Table) => table.name === utils.toTableName(column.name) || table.name === utils.toTableName(column.dataType.type),
    );
    if (target) {
      return target.columns.some(
        (col: Column) =>
          utils.toTableName(col.name) === source.name || utils.toTableName(col.dataType.type) === source.name,
      );
    }

    return false;
  }

  /**
   * Checks if a circular reference is required.
   *
   * @param  source - source table
   * @param  column - column which references another table
   * @param  schema - whole schema
   * @return  true if a circular reference is required
   */
  public circularRelationIsRequired(source: Table, column: Column, schema: Schema): boolean {
    const target: Table | undefined = schema.find(
      (table: Table) => table.name === utils.toTableName(column.name) || table.name === utils.toTableName(column.dataType.type),
    );
    if (target) {
      return target.columns.some(
        (col: Column) =>
          (utils.toTableName(col.name) === source.name || utils.toTableName(col.dataType.type) === source.name) &&
          !col.allowNull,
      );
    }

    return false;
  }

  /**
   * Checks if a circular reference is array.
   *
   * @param  source - source table
   * @param  column - column which references another table
   * @param  schema - whole schema
   * @return  true if a circular reference is array
   */
  public circularRelationIsArray(source: Table, column: Column, schema: Schema): boolean {
    const target: Table | undefined = schema.find(
      (table: Table) => table.name === utils.toTableName(column.name) || table.name === utils.toTableName(column.dataType.type),
    );
    if (target) {
      return target.columns.some(
        (col: Column) =>
          (utils.toTableName(col.name) === source.name || utils.toTableName(col.dataType.type) === source.name) &&
          Boolean(col.dataType.isArray),
      );
    }

    return false;
  }

  /**
   * Get related table names for a given table.
   *
   * @param  table - given table
   * @returns  - related tables
   */
  public getRelatedTablesForTable(table: Table): Column[] {
    return table.columns
      .filter((column: Column) => column.dataType.relationType)
      .map((column: Column) => column);
  }

  /**
   * Checks if a given column is an alias.
   *
   * @returns  returns true if column name and referenced type are aliases.
   */
  public relationIsAlias(column: Column): boolean {
    return Boolean(column.dataType.references && utils.similarity(column.dataType.references.name, column.dataType.references.table) < 0.5);
  }
}

export default new SchemaUtil();
