"use client";

import ShareImage from "@/components/list/ShareImage";
import { Category, ListItem } from "@/types";

interface ShareImageWrapperProps {
  title: string;
  category: Category;
  username: string;
  items: ListItem[];
}

export default function ShareImageWrapper(props: ShareImageWrapperProps) {
  return <ShareImage {...props} />;
}
