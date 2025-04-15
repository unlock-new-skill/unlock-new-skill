import { configResponsive, useResponsive } from 'ahooks'

configResponsive({
	sm: 0,
	md: 768,
	lg: 1200
})

export default function useBreakPoints() {
	const responsive = useResponsive()
	return { ...responsive, isMobile: !responsive.md }
}
