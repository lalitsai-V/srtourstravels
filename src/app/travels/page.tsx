import TravelsClientPage from "@/components/TravelsClientPage"

interface SearchParams {
  from?: string
  to?: string
  date?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function TravelsPage(props: PageProps) {
  const searchParams = await props.searchParams

  return (
    <TravelsClientPage
      initialFrom={searchParams.from || ""}
      initialTo={searchParams.to || ""}
      initialDate={searchParams.date || ""}
    />
  )
}
