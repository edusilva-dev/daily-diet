import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('updated_at')
    table.uuid('session_id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.timestamp('updated_at')
    table.dropColumn('session_id')
  })
}
