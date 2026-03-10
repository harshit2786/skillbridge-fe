import { Node, mergeAttributes } from "@tiptap/core";

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, string>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { src: string }) => ReturnType;
    };
  }
}

export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => {
          // Parse from wrapper div
          const iframe = element.querySelector("iframe");
          return iframe?.getAttribute("src") ?? null;
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video="true"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-video": "true",
        class: "video-embed-wrapper",
      }),
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          frameborder: "0",
          allowfullscreen: "true",
          style:
            "width:100%;height:315px;border-radius:8px;",
        }),
      ],
    ];
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});