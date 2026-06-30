/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
import { mdsvex } from "mdsvex";

export default {
    extensions: [".svelte", ".svx", ".md"],
    preprocess: [
        mdsvex({
            extensions: [".svx", ".md"],
            remarkPlugins: [
                function custom() {

                    type Heading = {
                        text?: string;
                        id?: string;
                        index?: number[];
                        children?: Heading[];
                    };

                    type Tree = {
                        type?:
                        | "root"
                        | "yaml"
                        | "heading"
                        | "paragraph"
                        | "html"
                        | "thematicBreak"
                        | "code"
                        | "text"
                        | "linkReference";
                        value?: string;
                        lang?: "mermaid";
                        depth?: number;
                        children?: Tree[];
                        position?: {
                            start: { line: number };
                        };
                    };

                    function fillLevels(
                        buildIndexesParent: number[],
                        level: Heading[],
                    ) {
                        for (var i = 0; i < buildIndexesParent.length; i++) {
                            const idx = (buildIndexesParent[i] || 1) - 1;
                            if (!level[idx]) level[idx] = { children: [] };
                            level = level[idx].children || [];
                        }
                        return level;
                    }

                    function setIndexes({
                        level,
                        containerIndexes,
                    }: {
                        level: number;
                        containerIndexes: number[];
                    }) {
                        if (!containerIndexes[level]) containerIndexes[level] = 0;
                        containerIndexes[level]++;
                        containerIndexes.splice(level + 1);

                        for (let i = 1; i < containerIndexes.length; i++) {
                            if (typeof containerIndexes[i] !== "number")
                                containerIndexes[i] = 1;
                        }

                        const current = [...containerIndexes.slice(1)];

                        const ancestors = containerIndexes.slice(1, -1);

                        return { current, ancestors };
                    }

                    function makeId(textContent: string) {
                        const slugify = (s: string) =>
                            s
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, "-")
                                .replace(/[^a-z0-9\-]/g, "")
                                .replace(/\-+/g, "-")
                                .replace(/^\-+|\-+$/g, "");

                        const base = slugify(textContent);
                        let unique = base;
                        if (typeof usedIds[base] !== "number") {
                            usedIds[base] = 0;
                        } else {
                            usedIds[base]++;
                            unique = `${base}-${usedIds[base]}`;
                        }
                        return unique;
                    }

                    let nodeYaml: Tree | null = null;
                    const usedIds: Record<string, number> = {};
                    const buildToc: Heading[] = [];
                    let nodeToc: Tree | null = null;
                    const containerIndexesToc: number[] = [];


                    return (tree: Tree) => {

                        function walk(node: Tree, parent: Tree) {

                            if (node.type === "heading") {

                                if (nodeToc) {
                                    let textFromTransformer = "";
                                    let allFromTransformer = "";
                                    let textContent = "";
                                    let textAct = "";

                                    node.children?.forEach((child: Tree) => {
                                        if (child.type === "text") {
                                            let value = child.value || "";
                                            textFromTransformer += value;
                                            allFromTransformer += value;
                                        } else if (child.type === "html") {
                                            if (child.value) {
                                                allFromTransformer += child.value;
                                            }
                                        }
                                    });

                                    const id = makeId(textFromTransformer);

                                    const { current, ancestors: indexesAncestorsToc } =
                                        setIndexes({
                                            level: node.depth!,
                                            containerIndexes: containerIndexesToc,
                                        });
                                    const indexCurrentToc = current;

                                    fillLevels(indexesAncestorsToc, buildToc).push({
                                        text: textFromTransformer,
                                        id,
                                        index: indexCurrentToc,
                                        children: [],
                                    });

                                    textContent += `<span class="index">${indexCurrentToc.join(".")}.</span> `;
                                    textAct += `<a href="#${id}" class="section-link" title="Section link"></a>`;

                                    parent.children![parent.children!.indexOf(node)] = {
                                        type: "html",
                                        value: `<h${node.depth} id="${id}"><span class="content">${textContent + allFromTransformer}</span><span class="act">${textAct}</span></h${node.depth}>`,
                                    };

                                }
                            } else if (node.type === "html") {

                                if (/<.*Toc.svelte/.test(node.value!)) {
                                    nodeToc = node;
                                }

                            } else if (node.type === "yaml") {
                                nodeYaml = node
                            } else if (node.type === "root") {
                                node.children?.forEach((child) => walk(child, node));
                            }

                        }

                        walk(tree, {});

                        if (nodeYaml) {

                            let header = "";

                            nodeYaml.value!.split("\n").forEach((line) => {
                                const values = line.split(": ");
                                if (values[0] === 'title') {
                                    const value = values[1].trim()
                                    const splits = value.split("-")
                                    const title = splits[0].trim()
                                    const tagline = splits.length > 1 ? ('<small>-</small><small>' + splits[1].trim() + '</small>') : '';
                                    header += `<h1 style="font-size:clamp(0.83rem,4vw,2rem);text-align:center;font-weight:normal;text-transform:uppercase;letter-spacing:2px"><a style="color:inherit;text-decoration:none;display:inline-flex;align-items:center;gap:0.5ch" href="/">${title}${tagline}</a></h1>`
                                } else if (values[0] === 'subtitle') {
                                    const value = values[1].trim()
                                    header += `<h2 style="font-size:clamp(0.67rem,3vw,1.5rem);text-align:center;font-weight:normal"><a style="color:inherit;text-decoration:none" href="/">${value}</a></h2>`
                                }
                            });

                            if (header) tree.children!.splice(tree.children!.indexOf(nodeYaml) + 1, 0,
                                {
                                    type: "html",
                                    value: `<header>${header}</header>`
                                })
                        }

                        if (nodeToc) {
                            tree.children![tree.children!.indexOf(nodeToc)] = {
                                type: "html",
                                value: nodeToc.value!.replace(/(\/>)/, ` list='${JSON.stringify(buildToc).replace(/{/g, "&#123").replace(/}/g, "&#125")}'$1`),
                            };
                        }

                        nodeYaml = null;
                        for (let key in usedIds) delete usedIds[key];
                        buildToc.length = 0;
                        nodeToc = null
                        containerIndexesToc.length = 0;

                    }
                }
            ]
        })
    ]
}
