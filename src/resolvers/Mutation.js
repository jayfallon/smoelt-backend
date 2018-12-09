const Mutations = {
	async createItem(parent, args, ctx, info) {
		// check if they are logged in

		const item = await ctx.db.mutation.createItem(
			{
				data: {
					...args,
				},
			},
			info
		);
		return item;
	},
	updateItem(parent, args, ctx, info) {
		//  take a copy of the updates
		const updates = { ...args };
		// remove id from the updates
		delete updates.id;
		// run the update method
		return ctx.db.mutation.updateItem(
			{
				data: updates,
				where: {
					id: args.id,
				},
			},
			info
		);
	},
	async deleteItem(parent, args, ctx, info) {
		const where = { id: args.id };
		// find item
		const item = await ctx.db.query.item({ where }, `{id title}`);
		//check if they own it or has permissions
		// delete
		return ctx.db.mutation.deleteItem({ where }, info);
	},
};

module.exports = Mutations;
