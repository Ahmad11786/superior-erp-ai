(function () {

    "use strict";


    const PENDING_PATTERN =
        /not\s+submitted/i;


    const IGNORE_PATTERN =
        /logout|sign\s*out|delete|remove|cancel/i;


    function clean(text) {

        return (text || "")
            .replace(/\s+/g, " ")
            .trim();

    }


    function findNearbyContainer(element) {

        let node = element;


        for (
            let level = 0;
            level < 8 && node;
            level++
        ) {

            const text =
                clean(node.innerText);


            if (
                PENDING_PATTERN.test(text)
            ) {

                const link =
                    node.querySelector(
                        "a[href]"
                    );


                const button =
                    node.querySelector(
                        "button,[role='button']"
                    );


                if (
                    link ||
                    button
                ) {

                    return node;

                }

            }


            node =
                node.parentElement;

        }


        return null;

    }


    function findPending() {

        if (
            document.querySelector(
                "form.js_surveyform"
            )
        ) {

            return null;

        }


        const elements =
            [
                ...document.querySelectorAll(
                    "body *"
                )
            ];


        for (
            const element
            of elements
        ) {

            const text =
                clean(
                    element.innerText
                );


            if (
                !PENDING_PATTERN.test(text)
            ) {

                continue;

            }


            const container =
                findNearbyContainer(
                    element
                );


            if (!container) {

                continue;

            }


            const links =
                [
                    ...container.querySelectorAll(
                        "a[href]"
                    )
                ];


            for (
                const link
                of links
            ) {

                const href =
                    link.href || "";


                const linkText =
                    clean(
                        link.innerText
                    );


                if (
                    !href.startsWith(
                        location.origin
                    )
                ) {

                    continue;

                }


                if (
                    IGNORE_PATTERN.test(
                        href
                    ) ||
                    IGNORE_PATTERN.test(
                        linkText
                    )
                ) {

                    continue;

                }


                return {

                    type: "link",

                    element: link,

                    href,

                    text:
                        clean(
                            container.innerText
                        )

                };

            }


            const button =
                container.querySelector(
                    "button,[role='button']"
                );


            if (
                button &&
                !IGNORE_PATTERN.test(
                    clean(button.innerText)
                )
            ) {

                return {

                    type: "button",

                    element: button,

                    href: "",

                    text:
                        clean(
                            container.innerText
                        )

                };

            }

        }


        return null;

    }


    function openPending(
        candidate
    ) {

        if (
            !candidate ||
            !candidate.element
        ) {

            return false;

        }


        if (
            candidate.type === "link" &&
            candidate.href
        ) {

            location.href =
                candidate.href;

            return true;

        }


        candidate.element.click();

        return true;

    }


    window.SEAListScanner = {

        findPending,

        openPending

    };


    console.log(
        "[SEA][LIST SCANNER] Loaded"
    );

})();