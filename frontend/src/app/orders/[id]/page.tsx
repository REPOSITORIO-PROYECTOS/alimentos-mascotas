import OrderDetailClient from "./OrderDetailClient";

// Server wrapper page: Next expects the page to be a server component with PageProps
export default function Page(props: any) {
    // Accept any props to satisfy Next's generated PageProps typing; forward params.id to client component
    const id = props?.params?.id;
    return <OrderDetailClient id={id} />;
}
