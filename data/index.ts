import { FaGlobe, FaInstagram, FaYoutube } from "react-icons/fa6";

export const hostedAt = "https://studystack01.vercel.app";

export const mainFooterLinks = [
  {
    title: "MSBTE",
    href: "https://msbte.org.in/",
  },
  {
    title: "Contact",
    href: `${hostedAt}/contact`,
  },
];

export const aboutPopoverLinks = [
  {
    title: "Our Team",
    href: `${hostedAt}/about`,
  },
  {
    title: "The Project",
    href: `${hostedAt}/about/project`,
  },
];

export const legalPopoverLinks = [
  {
    title: "Privacy Policy",
    href: `${hostedAt}/privacy-policy`,
  },
  {
    title: "Cookie Policy",
    href: `${hostedAt}/cookie-policy`,
  },
  {
    title: "Copyright Policy",
    href: `${hostedAt}/copyright-policy`,
  },
  {
    title: "Terms & Conditions",
    href: `${hostedAt}/terms-and-conditions`,
  },
];

export const footerIcons = [
  {
    href: "https://www.instagram.com/study_stack02/",
    icon: FaInstagram,
    label: "Instagram",
  },
  {
    href: "https://www.youtube.com/@StudyStack01",
    icon: FaYoutube,
    label: "Youtube",
  },
  {
    href: "https://poly.kkwagh.edu.in/",
    icon: FaGlobe,
    label: "Website",
  },
];
