const [row] = await (tx ?? this.db)
.select({ value: sql<number>`coalesce(max(${tasks.sortOrder}), -1) + 1` })
.from(tasks)
.where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)));

only db level operation available?
