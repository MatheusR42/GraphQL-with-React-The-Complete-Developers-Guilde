const axios = require('axios');
const graphql = require('graphql');
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList,
	GraphQLNonNull
} = graphql;

const CompanyType = new GraphQLObjectType({
	name: 'Company',
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		users: {
			type: new GraphQLList(UserType),
			resolve(parentValue, args){
				return axios.get(`http://127.0.0.1:3000/companies/${parentValue.id}/users`)
					.then(res => {
						return res.data
					});
			}
		}
	})
});

const UserType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: { type: GraphQLString },
		firstName: { type: GraphQLString },
		age: { type: GraphQLInt },
		company: {
			type: CompanyType,
			resolve(parentValue, args) {
				return axios.get(`http://127.0.0.1:3000/companies/${parentValue.companyId}`)
					.then(res => res.data);
			}
		}
	})
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		user: {
			type: UserType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve(parentValue, args){
				return axios.get(`http://127.0.0.1:3000/users/${args.id}`)
					.then(resp => resp.data);
			}
		},
		company: {
			type: CompanyType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			resolve(parentValue, args){
				return axios.get(`http://127.0.0.1:3000/companies/${args.id}`)
					.then(resp => resp.data);
			}
		}
	}
});

const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		addUser: {
			type: UserType, //this is the return type of resolve function
			args: {
				age: { type: new GraphQLNonNull(GraphQLInt) },
				firstName: { type: new GraphQLNonNull(GraphQLString) },
				companyId: { type: GraphQLString }
			},
			resolve(parentValue, {age, firstName, companyId}){
				return axios.post('http://127.0.0.1:3000/users', {
					firstName,
					companyId,
					age
				}).then(res => res.data);
			}
		},
		deleteUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) }
			},
			resolve(parentValue, {id}){
				return axios.delete(`http://127.0.0.1:3000/users/${id}`)
					.then(res => res.data);
			}
		},
		editUser: {
			type: UserType,
			args: {
				id: { type: new GraphQLNonNull(GraphQLString) },
				firstName: { type: GraphQLString },
				companyId: { type: GraphQLString },
				age: { type: GraphQLInt }
			},
			resolve(parentValue, {id, firstName, companyId, age}){
				return axios.patch(`http://127.0.0.1:3000/users/${id}`,{
					firstName,
					companyId,
					age
				}).then(res => res.data);
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation
});