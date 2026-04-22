import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	uuid,
	pgEnum,
	primaryKey
} from 'drizzle-orm/pg-core';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.schema';

export * from './auth.schema';

export const noteStatusEnum = pgEnum('note_status', ['learning', 'reviewing', 'mastered']);
export const noteDifficultyEnum = pgEnum('note_difficulty', ['beginner', 'intermediate', 'advanced']);

export const categories = pgTable('categories', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	icon: text('icon').default('📁'),
	color: text('color').default('#f97316'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const folders = pgTable('folders', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'cascade' }),
	parentFolderId: uuid('parent_folder_id'),
	name: text('name').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const notes = pgTable('notes', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'cascade' }),
	folderId: uuid('folder_id').references(() => folders.id, { onDelete: 'set null' }),
	title: text('title').notNull(),
	slug: text('slug').notNull(),
	contentJson: text('content_json'),
	excerpt: text('excerpt'),
	isFavorite: boolean('is_favorite').notNull().default(false),
	isPinned: boolean('is_pinned').notNull().default(false),
	isArchived: boolean('is_archived').notNull().default(false),
	status: noteStatusEnum('status').notNull().default('learning'),
	difficulty: noteDifficultyEnum('difficulty').notNull().default('beginner'),
	lastReviewedAt: timestamp('last_reviewed_at'),
	nextReviewAt: timestamp('next_review_at'),
	reviewInterval: integer('review_interval').notNull().default(1),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const tags = pgTable('tags', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	color: text('color').default('#f97316')
});

export const noteTagLinks = pgTable(
	'note_tag_links',
	{
		noteId: uuid('note_id')
			.notNull()
			.references(() => notes.id, { onDelete: 'cascade' }),
		tagId: uuid('tag_id')
			.notNull()
			.references(() => tags.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.noteId, table.tagId] })]
);

export const noteAttachments = pgTable('note_attachments', {
	id: uuid('id').primaryKey().defaultRandom(),
	noteId: uuid('note_id')
		.notNull()
		.references(() => notes.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	fileName: text('file_name').notNull(),
	fileUrl: text('file_url').notNull(),
	fileType: text('file_type'),
	fileSize: integer('file_size'),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const snippets = pgTable('snippets', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	title: text('title').notNull(),
	language: text('language').notNull().default('plaintext'),
	description: text('description'),
	code: text('code').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	user: one(user, { fields: [categories.userId], references: [user.id] }),
	folders: many(folders),
	notes: many(notes),
	snippets: many(snippets)
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	user: one(user, { fields: [folders.userId], references: [user.id] }),
	category: one(categories, { fields: [folders.categoryId], references: [categories.id] }),
	notes: many(notes)
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
	user: one(user, { fields: [notes.userId], references: [user.id] }),
	category: one(categories, { fields: [notes.categoryId], references: [categories.id] }),
	folder: one(folders, { fields: [notes.folderId], references: [folders.id] }),
	tags: many(noteTagLinks),
	attachments: many(noteAttachments)
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
	user: one(user, { fields: [tags.userId], references: [user.id] }),
	notes: many(noteTagLinks)
}));

export const noteTagLinksRelations = relations(noteTagLinks, ({ one }) => ({
	note: one(notes, { fields: [noteTagLinks.noteId], references: [notes.id] }),
	tag: one(tags, { fields: [noteTagLinks.tagId], references: [tags.id] })
}));

export const noteAttachmentsRelations = relations(noteAttachments, ({ one }) => ({
	note: one(notes, { fields: [noteAttachments.noteId], references: [notes.id] }),
	user: one(user, { fields: [noteAttachments.userId], references: [user.id] })
}));

export const snippetsRelations = relations(snippets, ({ one }) => ({
	user: one(user, { fields: [snippets.userId], references: [user.id] }),
	category: one(categories, { fields: [snippets.categoryId], references: [categories.id] })
}));

export const reviewLogs = pgTable('review_logs', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	noteId: uuid('note_id')
		.notNull()
		.references(() => notes.id, { onDelete: 'cascade' }),
	noteTitle: text('note_title').notNull(),
	result: text('result').notNull(), // 'got_it' | 'needs_work'
	reviewedAt: timestamp('reviewed_at').notNull().defaultNow()
});

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
	user: one(user, { fields: [reviewLogs.userId], references: [user.id] }),
	note: one(notes, { fields: [reviewLogs.noteId], references: [notes.id] })
}));

export const guideNodeTypeEnum = pgEnum('guide_node_type', ['file', 'directory']);

export const guides = pgTable('guides', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
	title: text('title').notNull(),
	slug: text('slug').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const guideNodes = pgTable('guide_nodes', {
	id: uuid('id').primaryKey().defaultRandom(),
	guideId: uuid('guide_id')
		.notNull()
		.references(() => guides.id, { onDelete: 'cascade' }),
	parentId: uuid('parent_id').references((): AnyPgColumn => guideNodes.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	type: guideNodeTypeEnum('type').notNull().default('file'),
	sortOrder: integer('sort_order').notNull().default(0),
	explanation: text('explanation'),
	codeContent: text('code_content'),
	codeLanguage: text('code_language').default('plaintext'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const guidesRelations = relations(guides, ({ one, many }) => ({
	user: one(user, { fields: [guides.userId], references: [user.id] }),
	category: one(categories, { fields: [guides.categoryId], references: [categories.id] }),
	nodes: many(guideNodes)
}));

export const guideNodesRelations = relations(guideNodes, ({ one, many }) => ({
	guide: one(guides, { fields: [guideNodes.guideId], references: [guides.id] }),
	parent: one(guideNodes, { fields: [guideNodes.parentId], references: [guideNodes.id], relationName: 'parent_child' }),
	children: many(guideNodes, { relationName: 'parent_child' })
}));
