import LanguageToggle from './language-toggle'
import ToolsMenu from './tools-menu'

/** Fixed top-right controls of the public site. */
export default function SiteToolbar({ locale = 'vi' }) {
	return (
		<div className="fixed right-4 top-4 z-50 flex items-stretch gap-2">
			<ToolsMenu locale={locale} />
			<LanguageToggle current={locale} />
		</div>
	)
}
