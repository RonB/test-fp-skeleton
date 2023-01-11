// AppBar Navigation
// move these to the database and apply authorization
export const menuNavLinks: any = [
	{
		id: 'organization',
		title: 'Organization',
		readers: ['user'],
		icon: 'ic:round-factory',
		list: [
			{ href: '/organization/configuration', label: 'Chatbot configurations' },
			{ href: '/organization/users', label: 'Users' }
		]
	}, {
		id: 'services',
		title: 'Services',
		icon: 'ic:baseline-add-ic-call',
		readers: ['user'],
		list: [
			{ href: '/services/translate', label: 'Translate' },
			{ href: '/services/qanda', label: 'Question and Answer' },
			{ href: '/services/summarize', label: 'Summarize' },
			{ href: '/services/images', label: 'Image generation' },
			{ href: '/services/graph', label: 'Graph' },
		]
	},
	{
		id: 'documentation',
		title: 'Documentation',
		icon: 'ic:baseline-folder',
		list: [

		]
	}, {
		id: 'admin',
		title: 'Administration',
		icon: 'ic:baseline-settings',
		readers: ['admin'], // nog niks he...
		list: [
			{ href: '/admin/configuration', label: 'Chatbot configurations' },
			{ href: '/admin/swagger', label: 'Open API documentation' },
			{ href: '/admin/querybuilder', label: 'Query builder' },
			{ href: '/admin/explorer', label: 'File explorer' }
		]
	},
	{
		id: 'references',
		title: 'References',
		icon: 'ic:baseline-link',
		list: [
			{ href: 'http://www.rasa.com', label: 'Rasa', target: '_blank' },
			{ href: 'http://haystack.deepset.ai', label: 'Haystack', target: '_blank' },
			{ href: 'http://weaviate.io', label: 'Weaviate', target: '_blank' },
			{ href: 'http://www.huggingface.co', label: 'Huggingface', target: '_blank' },
		]
	}
];
