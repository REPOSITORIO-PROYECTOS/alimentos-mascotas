import React from "react";

export default function Footer() {
    return (
        <section className="py-32">
            <div className="container mx-auto">
                <footer>
                    <div className="grid grid-cols-2 gap-8 border-t pt-20 lg:grid-cols-5">
                        <div>
                            <h3 className="mb-4 font-bold">Product</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Features</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Tasks</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Calendar</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Conferencing</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Invoicing</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Security</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-bold">Resources</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Blog</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Pricing</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Roadmap</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Changelog</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Resources</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-bold">Case Studies</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Shadcn</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">React</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Tailwind</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-bold">Integrations</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Hubspot</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Slack</a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 font-bold">Company</h3>
                            <ul className="space-y-4 text-muted-foreground">
                                <li className="font-medium hover:text-primary">
                                    <a href="#">About </a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Company</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Support</a>
                                </li>
                                <li className="font-medium hover:text-primary">
                                    <a href="#">Book a demo</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center">
                        <ul className="flex justify-center gap-4 lg:justify-start">
                            <li className="hover:text-primary">
                                <a href="#">Privacy</a>
                            </li>
                            <li className="hover:text-primary">
                                <a href="#">Terms</a>
                            </li>
                            <li className="hover:text-primary">
                                <a href="#">Imprint</a>
                            </li>
                            <li>
                                <p className="text-gray-400">
                                    © 2024 Shadcnblocks. All rights reserved.
                                </p>
                            </li>
                        </ul>
                        <ul className="flex items-center justify-center gap-4 lg:justify-start">
                            <li>
                                <p className="text-black">Follow us:</p>
                            </li>
                            <li>
                                <button
                                    data-slot="button"
                                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([className*='size-'])]:size-4 [&amp;_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 has-[>svg]:px-3 gap-2 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-linkedin h-4 w-4"
                                    >
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect
                                            width="4"
                                            height="12"
                                            x="2"
                                            y="9"
                                        ></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                    Linkedin
                                </button>
                            </li>
                            <li>
                                <button
                                    data-slot="button"
                                    className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([className*='size-'])]:size-4 [&amp;_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:ring-4 focus-visible:outline-1 aria-invalid:focus-visible:ring-0 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 has-[>svg]:px-3 gap-2 rounded-full"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        className="lucide lucide-life-buoy h-4 w-4"
                                    >
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="m4.93 4.93 4.24 4.24"></path>
                                        <path d="m14.83 9.17 4.24-4.24"></path>
                                        <path d="m14.83 14.83 4.24 4.24"></path>
                                        <path d="m9.17 14.83-4.24 4.24"></path>
                                        <circle cx="12" cy="12" r="4"></circle>
                                    </svg>
                                    Product Hunt
                                </button>
                            </li>
                        </ul>
                    </div>
                </footer>
            </div>
        </section>
    );
}
