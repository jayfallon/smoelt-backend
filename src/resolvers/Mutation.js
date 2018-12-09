const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
	async signup(parent, args, ctx, info) {
		// always lowercase the email
		args.email = args.email.toLowerCase();
		// hash the password
		const password = await bcrypt.hash(args.password, 13);
		// create the user in the db
		const user = await ctx.db.mutation.createUser(
			{
				data: {
					...args,
					password,
					permissions: { set: ["USER"] },
				},
			},
			info
		);
		// create JWT token
		const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
		// set the jwt as a cookie on the response
		ctx.response.cookie("token", token, {
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
		});
		// return the user
		return user;
	},
};

module.exports = Mutations;
