/**
 * CETAS REAL TOURNAMENT DATA
 * Diambil langsung 100% dari database cadangan turnamen LKBB Cetas.Score:
 * C:\Users\Reza Aditya Arifin\Desktop\CETAS-SCORE-DATABASE-BACKUP.db
 */

export interface RealOption {
  id: string;
  label: string;
  score: number;
  sortOrder: number;
}

export interface RealCriterion {
  id: string;
  name: string;
  section: string;
  interval: number;
  difficulty: "MUDAH" | "SULIT";
  sortOrder: number;
  options: RealOption[];
}

export interface RealSubCategory {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  criteria: RealCriterion[];
}

export interface RealCategory {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  eventId: string;
  eventLevelId: string;
  levelName: string;
  subCategories: RealSubCategory[];
}

export interface RealParticipant {
  id: string;
  eventId: string;
  eventLevelId?: string | null;
  categoryId?: string | null;
  displayOrder?: number | null;
  number: number;
  name: string;
  school?: string | null;
  level?: string | null;
  photo?: string | null;
  logo?: string | null;
  status?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  [key: string]: unknown;
}

export interface RealJudge {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  pin: string;
}

export const REAL_EVENT = {
  "id": "cmt1t1kzd0002tba86ao0a6vu",
  "name": "LATIHAN GABUNGAN VOL.1",
  "date": 1787356800000,
  "location": "SMPN 220 JAKARTA",
  "logo": "data:image/jpeg;base64,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",
  "banner": null,
  "status": "INACTIVE",
  "inputMode": "DIGITAL",
  "totalPoints": 5000,
  "createdAt": 1787247546744,
  "updatedAt": 1787955669717
};

export const REAL_LEVELS = [
  {
    "id": "cmt2br2w60000tb4o1qg0gl24",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "code": "SD_MI",
    "name": "SD/MI",
    "sortOrder": 1,
    "status": "INACTIVE",
    "createdAt": 1787278969445,
    "updatedAt": 1787280621536
  },
  {
    "id": "cmt2br2w80003tb4otaxhdave",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "code": "SMP_MTS",
    "name": "SMP/MTS",
    "sortOrder": 2,
    "status": "ACTIVE",
    "createdAt": 1787278969445,
    "updatedAt": 1787278969445
  },
  {
    "id": "cmt2br2w80006tb4oi44t3atr",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "code": "SMA_SMK_MA",
    "name": "SMA/SMK/MA",
    "sortOrder": 3,
    "status": "ACTIVE",
    "createdAt": 1787278969445,
    "updatedAt": 1787278969445
  },
  {
    "id": "cmt2br2w80007tb4oouaxt7by",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "code": "PURNA_CLUB_UMUM",
    "name": "PURNA/CLUB/UMUM",
    "sortOrder": 4,
    "status": "INACTIVE",
    "createdAt": 1787278969445,
    "updatedAt": 1787280678100
  }
];

export const REAL_JUDGES: RealJudge[] = [
  {
    id: "cmt1t01wq0001tba8ix1zj42a",
    name: "Fadhilah",
    username: "fadil@cetas.score",
    role: "JUDGE",
    status: "ACTIVE",
    pin: "1111",
  },
  {
    id: "cmt26wrvb0000tbr0glyy6mpn",
    name: "ARDI PURWANTO",
    username: "ardi@cetas.score",
    role: "JUDGE",
    status: "ACTIVE",
    pin: "2222",
  },
  {
    id: "cmt26zflp0001tbr05p4c54o4",
    name: "Reza Aditya Arifin",
    username: "reza@cetas.score",
    role: "JUDGE",
    status: "ACTIVE",
    pin: "3333",
  },
  {
    id: "cmt270cs40002tbr0vxkbmxit",
    name: "Slamet Mey",
    username: "mamet@cetas.score",
    role: "JUDGE",
    status: "ACTIVE",
    pin: "4444",
  },
];

export const REAL_PARTICIPANTS: RealParticipant[] = [
  {
    "id": "cmt29x4ry0001tbisadizppav",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": null,
    "number": 1,
    "displayOrder": 1,
    "name": "SMPN 220 JAKARTA",
    "school": "SMPN 220 JAKARTA",
    "level": "SMP/MTS",
    "photo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCABxAHEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKAIpG5IxzVa/uDaWsku3O1C2PoPWrLsQ5GO3WuV+I3ie28MeE9RvbiURosTYLfTn9K4cXW9hRlU/q/QuEOaaRT8GfEvS/FcShZFtboZBgkbHP1712SN15z9RX8+HiX9rPxp4W+N3ivxH4S1uSHT72+dktXPmW80anapK544HavZNG/4Kz/ELTNNjtptGtJnQY8xLp1Vj/u44FebSlj6cE5xU7+dn87nVKnRlLljKx+yeu+IbDw9bPLf3CxLjcq/xMR/sjrXJfD741eHPiAJV06/gdo5XhykyyLuU8ruB+8P7p5r8R/j1+2H8YPHU8mkatdP4ct7mJZHsrIlZHRwdoZ+vI9MV5R8PPi945+Cms/bNB1W80uVyJJbWUN5Uo/20br9a0VPG1ffckn/L/wAEOWily7vuf0oiVNg+ZST3HGao6xrdlo0Bmu7hI41Ukhm5P0Hevxvsv+Cn3xT8GaVYR6n4dt5HuYBPDOJ2jWSMkjcBg/zryX4rft//ABR+KFrParex6BZTfLItiT5pX0Mp55+lJVcdWVlTUX3vdClSpQ+KVz90fAvjm18bNfz2kZW3gdUVyeW45yB6V18eDzXwd/wS3+L1p4u+DNnpMt1/xMrFjaTiR9zFhyhJP95cmvuuNmEiqOncf57VvgalScZQqu8ouxFeChJOGzRaooor1jmCiiigAooooA5Px/49sPAWnG7vt5BRmUKuR8oycnsMV+RH7cX/AAUEn+KqXvhDwXcldNkHlXepRMVWRe8cWecHoW74r9hfFvhu18UaXPY3cYkikXHzDoccGvwT/bw+A0fwX+M119hiWDS9WDXMcSjCxyBiHUegz83414Moc+OUaz93eK8+tztptKm5wWq3Pmskk/K3HUe1a3g6K3m8V6Mt2M273kQkGeqlhmvU/wBnX4IeHPji2taHd+Kl8PeLo4xJpEE6gw3pA+aMf7ftnpXker6Vd6HqlxY3cD2dzaymN45AVKuDg+/avadSE3KknZmKhKKVR6o+6/jd8PdB8Rr/AGneFtLvtJgR7PVoowwCoAVRh/EOnXpVHxB8N9L+NU+g+NdfuodQhsdOih+w2cYRrk5O0SFRgYIYkdcGuR8HfE/x/o3hfwvfeLfDg1LQLq3E1vrpAkjkgHGyRRkFuAuCM5IrU1Px9H4duzb+ENF1HVEuJvtsOmspRpQ2BgKgx8jHkHnBr5P2GLot03LVXt6M9qLoVaVlozmf20bGzttD8FSRwR29yFkgREG3bAoG1ceg9fevlcEscJyfTPpXpn7QOq+NL74g3Vr43iSy1W0jQCwjYFLRGAYIMZ7Hn3rovhr+z5pmsfB/XfiP4u8Rp4d0K2LwWFoI83Go3AXKrHntng19BhV9Uw8YV3d/nc8malWm+T+kY/7Ov7QOufs9+Oodc0tmuLOXC3tiXKrMmeCPRgeQa/bL9mn9sDwz8dvD1nc2EzTXJKxSKqHzIXI+5KMcH6ZzX4C6Jot14j1zT9LsUMl3fTpbwRnqWZsL9OSK/fj9jD9nLTPgd8NtLtYYla9MQaWcqN0spGXkJ9SeB6Ae9cONhFYmDoaTlv6LuVB3ptVNUtj6QWRj3GB1qaohEcgk9sYFS17cL21OIKKKKsAooooAgmBL9MjHXNflJ/wWR021RvClzx9o+1Pkgc8ov+Ffq3OcZ5wMV+Mn/BWDx+nir4qaBoEDFvsoe5cDsWOwA/8AfP6142Ks8VStum3+B24aLnzLvp97R87fAXwIJo38R3YceS/+iEMVIkHO8EelfU/7Qn7HPif4l/BzTfiLHpog8UJAZJoIhl7qIDKu47SEdh+NZv7KPwyXxZ4t8EeGXixbDF3dI3TavzMPx6V6l/wU+/a+174ZeLvDnwz8CXx0+XT0h1HVXhwTL0MNu2P4ccsO/FeRQjWx2Jniac/hei6H6RxDTwuU4DDZbTgudrmk+up+cngL4reKPhNqrW8UszWKORd6Le5aBj3BjP3WyBz1ruvGH7XnifxFpb2mj6fZeF7iU/Pd6YgSYpjlQ3UZ4yR6V7v8R/2W7z9pzw/4e+Inhmw07wRruuyG1u9L1u7S2W9vQBkW4JycnHX1rzPwR/wTz+J2v3VtHrbaR4aee9a1gs9S1GNLq8ZDiRYUzlsevvX09OanD2k42a3Xmflza2TOZ/ZW/Zr1/wDaW+IcYl+0tpcUonvr+VS/mjP3Qx6k4617t+0B4Ll1m8u/CV/pp0KLRVNtp1irHbbBRw4xwS/Ukdc1zXxB/aQvv2ZvHXg/wp8ObG70DSfCV4Jb+W7Qo+rThtsyv/fiGCAOhPNfXf7aFjp3irS/AXxM0SJVsfEFjHu24xtdBIhJ9ecV8xmVPEzjHGJ8vK9uyP0ng2pg3jngMTBSVSNr+dj8+v2M/Ckd5+1L4a0+9iDG1klco4z8yodv5HFf0CaHCsFhbRINqxxqMehxX4H/AA516H4Y/tb6Fqlwxht5rzYX6YWUbQfzNfvR4T1KPV9DsLpHDeZGGJHc4r0qNVVcRCo+sdD5HNsI8FWqYdL4ZM3aKKK93Y8AKKKKV0AUUUmMHNO4HM/ELX4vDfhfUL2ZtqJE38uv4DNfhRr0kPx4+OvirxlfXKTW1vemOK1TJ8xE+VD7A4ya/Vn/AIKF+PZ/An7P3iG7t5DHN9ldUI7s2E/kxr8NfhZ49bwD4v07ULmKW80xJkN9Zo+0zw5+dc+uM14EqVXEzqyg7NaL9T6XJ8VhcDiKdbF0+aKd/u2P15/YH+FV0+p6l4/1KMQafFE1tZMRt345eTPp2z7V+Xn7R3jw/E39qLxf4iS5W7hudeZbaWLkeSsm1MZ7YFffH7Vf/BRX4f6T+zhY+FfgtqCPqmu2f2SRI42jfR7bbh1YY/1h5AwTjrX5XabcC31O2neMzLHKsjoDy+Gz+telgsLHCUVTiY53m085xssVPRPRLslsj9r5rLTdV0P4TaXd+Db3xbcTeIRPaNY3IgFg0aoxnkJGMYGdvGcYrb+IB8OzfFj4XnWPDF7rWvf2ne/2XrdrO8b6cd2XIAUqeMZ3Y4PFfPEv7U0Pwb+DOmeKdY0aJbnVGU2VnqETi/uwABuwHARFA64rl/DP7byeCdY0DRvEnhv7JYeIl/tCDU9YV5DHFMxAxhwVXII9e5rSNek1eLv+ttzxXCVtEeHf8FJQT8XdNyVKm2m2kAAEec/I/wDr19dfAmzf9oP/AIJy6DbaVP8AbvEHhS4eOS1zuceU5KoR7x4Ir4t/byF4PiLpgubKS3tltS9pMF/0eWJ2LL5TZO5QD1Jpv7Cf7YU/7KPj2+bUre51XwZrEJTUdPtsF/MA+SWMHjI6H1FE4wxlBxTupI7cFiquXYqniYfFBpln4v8AhrTr3w/JrM80tnd2A/dvEozuzwpzzkH8q/Tf/gnh+0FF8XvhPp0U8qnUrVfs10meVmQAHj0YYI+hr8gv2kvjyPjV8Rtb1rS9NGg+H7y5aW20yM8KP7zY/jbqa+l/+CR/iy40r4r61pQdvs08UdwUzwHB2g/kxrwFg5YPDxlKV3F/g+h9Pn+cYfO8T7WlT5brX1P2mBzTqgALYPvUo6n6V9LF3ij4brYdRUWaKvlFclqCWVlcgEAdMkcCvPvH/wC0R8PPhVr1no/jLxZpvhm/vIDc26alL5SzIDglWPBOe1fFf/BSX9u7SPD/AMMtN8LfC/xba6hrXiCQS3Gq6NdCX7HbRsDwyn5XZsAewaluhnrv/BS3w7ceI/2cteS3RpJI4DIAo67WU/0Nfhx4T8J6p4412LStItjcXcmThjhEUclmbsB61+4X7Mnx00T9tj9m1rO4eM+KtNtlsdZsGPJfZt8wDqVdc4Prmvyg+N3wv8T/ALJHximax86HS5ZXaynKny5oC3MMg6EjoVPsa8ihOVCvUo9XqvPud3uypx8tzxHUdNn0nUZrK4UxzxOUZevf9RX0Z+zX8G9G0jw5d/Fr4hxtF4S0h/8AQ7Vjh9SuMcRoOrc4HHSmR6fon7SWjhheWem+LINxS22BZXyflT/bUnoR90cUzwh47v8AwDfnw38RJ7/UNL0KCfT9JtbaNZ7aAs22VxgcsuevY8U8RVnVouCVmt11t5GsKMYz5r3T2fb1MzT/ANozWPHHx9tfFOvHT4NGnlW0az1K1E9paWAP3FQg4wBwRyTXsf7SH7VPgf4kfDW9tvBdnaWmrWs4sQdU01DLNZkEbrdiCE6fd6gGqtv4p+EevaH/AGbpd5YaWLqxt0W41CNUntEgfMiE9C8gLfXNat/43+FWl6nBGZNIn8N6gbrUPtRjjNxCojSJEEZGAzEscH+7mvDnOnKpCfsJJw2X+Z3RjKKdOVRWZ538DviBo/xp8Er8G/iNcmB1Ur4a8QTj57SU/dgZj/Ax6V4B8TfhvrPwn8bal4Y161e1vbOQg7hxIv8AC6nuCOc19S6x4r8A3zafp2m2k/iiT7IxaTRrACS3VFCxxu5GDkgEsORXF6To0upak3jL4r64b7VdH8qyNjqcTMIlC/uS3/PQFcEEcHPNetha0lKVVRcYvp1v3OWpRvFRcvn5HiupfCTxPpnge18X3WmtFoNzJtSZmAwexK9QG7Gvq/8A4JQeHr3UvjZqV9CjPbwWixsQDjcXDYz64U/lXzn8QPiDqnxs8VWei6FYzJYtP5VjpkQG+V2ONzBeCc9PQV+sH7F/wP0T9kT4J6j4t8YXcOnxwQG/1O+lbau8D7q+u37q/wB4tV4upOpSVFr35W08rmMUotzj8K09T7fjc9Pfp3+tTn73tivyO/Z7/wCClOoa1+2drGo+J9Qax+HPilxYW8F3LiLTFTPkSc8Lu53eu4elfok37W/wfOr2mk23xD0LUNVup1tYLGwulnlkkY4ChV7160Y8qUUee7nr2BRUfnH/AJ5v+VFbXRlZnzT+3b+yhb/tU/CG40+z2Q+LNJ3Xuj3DDGXAO6Fj3VxwPQkGvwafwLr0fi1/DD6XcL4gjuTZtpxQ+as27bsx25r+l/xnpms6p4W1a00DUE0fW7i1kis9ReLzFt5SpCMV74ODX4g+HdY8Q/sy/tLa5F8XrFU8X3V29zc+KNTQz+ZAFYs0CgYZpcBQ+flzXPXqTp0ZThHmkjqowjOcYy0TPH/ht8RfH/7Hvxgj1jR5PsWr2Enk3UAbfa3kfBeFiOGHbI6Gv1k8Ja78L/8AgpR8Ibu4j0xrXU7fYmqaZcIQ9rcEfKUkA+pDDnHWviDxdoi+L/AGueJPiVYXt5cPdrHo2n2pEf2KG4DG2MAA/euxUbhk4r279kL9ps/seeFNP+H3xJ8CLpumGJdRn8SaBAZmh81iAb8L0IxjPXgcV5PtqWPjy1tJra3fyO2VCdB89LVHiPxk/wCCZ3xA+G+rPqHgq6OoWsTkxRTSeTcx85+V/un8DmvOvD8vxR+F6tY6/wDDW61COJPLa7WyZpdu7fguAQ2WAJ9a/cf4ffErwZ8XtGi1Hwt4g0vxJYSL5itaSLIwU93Q/Mn4gVqX3gPQb7PnabC+eTuHeiVPGRjy3U/W6f3kU61O92mvQ/Bq9+IPwyvL+9ufEXgu7sNRaIolm8AQKwjddxPUsXZWP+6KxvDHjH4T22h2L3vh2SfWbYLHLlfNS66ktg/db7oBr9iP2iP2O/BPxZ8IXlvc6PEbgIzJNGoE0DY+/GwA5HoetfM/7FH/AAT30fw3eajrXi62g1XULe6ZIHkXesUQPybVPRz1JPSuF1oU17OcZKfRJ7+h1qblH2kJXiu+58mWHxL8ZavaSWnw5+Gt9bQSyLJFI1mSkLAYYAAYII7E03Q/2Kvjl8cdajvdftjpu5VQSXzElEH3VEa5IA7A1+2mj/DXw7ocCxwadAGTodoz+mK17s6X4YsJby6ms9JsYxlrm5kWKNPcsxAH51106WKWyUfvbOapXpy2Vz4e+Af7EPgf9lTwvf8AjzxdMZDpcDXN7qNxFvkSNRlgiLnaD7cmvhn9tr9uPWP2pNZg8M+F7e40n4eWMuLPTEB82+ccCSVR/wCOp2+tfoT+0J/wUW8CeHtO1vwz8PtJb4s6/FaSi7trOMyWFvGBhzM+DvUZ5Cgj3FfCHhL4d6p8HPDEfxc0Dwtp3jHWbq7NzClnFvtbS1f5t8EX3g68qeDtrS9LBtzk+ao9NXuRCM8Q7tWifKHjX4d+IPh/NZprumyWH22EXMEjcxyIf7rDgkdx1FfpB/wSh/Y2njvV+M3jHTmtwgKeHLW5j5YkfNdYP1wv4mvkz4k+PrGfRrnR9OX/AITXw/4r3X2naZcyM2o6HqDNh0BAJ5Yn5RwwI6Yr9Z/+Ce/w5+KPw4+AOnWfxN1VrqeULJp2kzqPO0y22jbE7+vfb2zivWpTnOHvqzOatCMJWg7n0/5f+1+lFJvT1/nRV8sjnvLsSsOBXjv7R/7MPgj9prwm2i+LtN33EWWsdVtwFurN8dVbuvqp4Nex5+XPWjOR1pbO43rY/GH4m/Az40/sZ+JLK81axPxJ8A2DeVp+rmF7hdPhZsOxhBykmzIBOQOoIrldG+M51LXdZ1nwbdxy69411CPRdL0a4/erZ6fEPmknjOQWYE4znGCa/b68t0uUkimVZIJEKPG43BgeCCDwQc9DXyj8Zf8Agm58J/ihqD61o1tc/D7xM7Fl1Pw4/kqWII+aP7oB77QOtcFTB0qj57Wb0O6li500k9Vc+DPHnw58PeFNVTUPCOtz+DtV0+yn1W61Tw3dOFubWNMRySpwod5sgDpipb/9tD9pb9njSvCK6j4vsfE82u232iCy1W2E0kA3BRHIV2ndyDjPFereKP2C/jp8PWeLTZtC+J+gotqJIpJPsV3JbW7borcqchlzjPrXhHxz8GfE/XPHHgbV/Fnwl8QeF4dFmMuqyWtkZ7aRTOHaWIDJPA5B/CuTDwxOHSjN3ST/AOAddaVCsm4KzbPo+L9v/wDaN0LxDp+maz8I9I1We6gaVE0+bZ5gUDd8+4hcbhkHkZqvqn/BQn416J4fvNS0n4G2ejadBIZLq6mn86MEsFLEgjnLAd68v1L4u+G7z4hwK141rbPpV4vm6lpNzbWTyyyRlVkUfNv2qdzA+mK8UtfGptvDOv8Ahu4v7gwN4ssLqCOxhuXt3tVLGYx7skoPl4PWs6NfETSnOmlL0ZUqGHV1zafqfSt/+2V+1f4/1+98PWdt4d8GXNvNFBKY7f8AfQmVN8bEszAqR3x1r57/AGiLX4h6n4VTxB438f614vura7txq2l3EhhhiimQOvyKQPvHZyK9eXx3feIfiZH4g8EeAfG2veZa3Wj38X9mtvmjJLW1wjYA4ZuFPIHetgfsrftD/Hlbs3vgbT/CFrrGi22k6pN4husPI8LbkuEjXkOPeilPHVasXJWhbXuTKOGpxa3kcvo1x4Z0HVfDPxL8PSHwn4angTSLyIaeLcLbzL+7cSbiJijcMcDjqK5bQfEHjH4zeIZvCfwD8PausMl99sS4aQrbaVcKSkkkcuNvlSA7ihz16V9ifBr/AIJOeGPDmnWFt8SvF2q+Obe0YvFokU0kGmxsepCZzn6EV9veCfA/h/4d6Nb6N4Z0Wy0HSolAW1soVjXjucD5ifU81008vpwnzzbb6XMKmNco8sFY+Vv2Qf8AgnN4b+AN6vjDxbLF4v8AiJMxnN5JEBbWUjct5SdC2Sfn/ICvsJI2QDLEA8sOufpVrFOAxXr7nnt3ZDtH/PNqKmzRT5vMCKP/AFVA7UUUnuZz+Iik/wBaPpQe30P8qKKr7f8AXY0jsRH/AFK/7o/lVqTo/wBRRRUy2Y1ujzn4q9bP/cP/AKEK5bw5/wAhaH/r5Wiis10NH/Dke2wdX/z3qD/l7l/3h/KiimtmLqyaL/WSfWli+6KKK2e/3GUuhKOlOPSiikwG0UUVkB//2Q==",
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt2e7seo0001tb5wv2gzyund",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": null,
    "number": 1,
    "displayOrder": 1,
    "name": "SMAN 33 JAKARTA",
    "school": "SMAN 33 JAKARTA",
    "level": "SMA/SMK/MA",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt29xpba0003tbismg1nvlqo",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": null,
    "number": 2,
    "displayOrder": 2,
    "name": "SMPN 69 JAKARTA",
    "school": "SMPN 69 JAKARTA",
    "level": "SMP/MTS",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt29ylk90005tbiswjue3yi1",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": null,
    "number": 3,
    "displayOrder": 3,
    "name": "SMPN 88 JAKARTA",
    "school": "SMPN 88 JAKARTA",
    "level": "SMP/MTS",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt7lk0rr03z1tbj44slbzzkn",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "number": 4,
    "displayOrder": 4,
    "name": "SMPN 1 JAKARTA",
    "school": "SMPN 1 JAKARTA",
    "level": "SMP/MTS",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt7mg63n04cftbj4udggald0",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "number": 5,
    "displayOrder": 5,
    "name": "SMPN 2 JAKARTA",
    "school": "SMPN 2 JAKARTA",
    "level": "SMP/MTS",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  },
  {
    "id": "cmt7mgk2404chtbj4tpv79s6w",
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "categoryId": null,
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "number": 6,
    "displayOrder": 6,
    "name": "SMPN 3 JAKARTA",
    "school": "SMPN 3 JAKARTA",
    "level": "SMP/MTS",
    "photo": null,
    "logo": null,
    "status": "ACTIVE"
  }
];

export const REAL_CATEGORIES: RealCategory[] = [
  {
    "id": "cmt1t6iyu0001tbv846e4ooqc",
    "name": "PBB",
    "percentage": 55,
    "sortOrder": 1,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "levelName": "SMP/MTS",
    "subCategories": [
      {
        "id": "cmt1t8bfq0003tbv8satlwcea",
        "name": "GERAKAN TAMBAHAN",
        "percentage": 5,
        "sortOrder": 1,
        "criteria": [
          {
            "id": "cmt1taotz000ctbv8py6ezx9y",
            "name": "Berkumpul",
            "section": "GERAKAN TAMBAHAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdialcn0292tb9kdjs808l6",
                "label": "KURANG",
                "score": 19,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco0293tb9k3entd7la",
                "label": "KURANG",
                "score": 25,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco0294tb9kvr9btobf",
                "label": "KURANG",
                "score": 31,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco0295tb9krskqa60c",
                "label": "CUKUP",
                "score": 37,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco0296tb9k43r3m9m6",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco0297tb9k9dv5e0x7",
                "label": "CUKUP",
                "score": 49,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco0298tb9k0tdewq7h",
                "label": "BAIK",
                "score": 55,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco0299tb9kkqllbeza",
                "label": "BAIK",
                "score": 61,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco029atb9k401i86s3",
                "label": "BAIK",
                "score": 67,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco029btb9kimrq4jkh",
                "label": "SANGAT BAIK",
                "score": 73,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tbes3000ftbv87fjfs6y9",
            "name": "Sikap Sempurna",
            "section": "GERAKAN TAMBAHAN",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdialco02a6tb9kdwdkgf34",
                "label": "KURANG",
                "score": 6,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco02a7tb9kkrcebyzz",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco02a8tb9knx3wa6h0",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco02a9tb9kxj8vgjh7",
                "label": "CUKUP",
                "score": 12,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco02aatb9kptegkros",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco02abtb9kxh58vyo9",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco02actb9ka2wfxuux",
                "label": "BAIK",
                "score": 18,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco02adtb9k0vw6y6r8",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco02aetb9kmj5so4xp",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco02aftb9ksampbttc",
                "label": "SANGAT BAIK",
                "score": 24,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1t8pwb0005tbv8pfanmngd",
        "name": "GERAKAN BERJALAN",
        "percentage": 45,
        "sortOrder": 2,
        "criteria": [
          {
            "id": "cmt1tgmoz000ltbv8nvpc1pca",
            "name": "Hadap Kanan Maju",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdialco029ctb9k5grwbve6",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco029dtb9kgtfki6it",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco029etb9k4c7orld4",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco029ftb9kiiwi7z2t",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco029gtb9k1p823e2t",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco029htb9kr0gobli6",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco029itb9kfefkjnjn",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco029jtb9k014h2d6n",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco029ktb9ky7b3y0es",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco029ltb9ksycvahk3",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1thayl000otbv8di5qsn7e",
            "name": "Ganti Langkah",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdialco02agtb9kaz6luaj3",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco02ahtb9k3q7f9969",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco02aitb9kildksr1g",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco02ajtb9kesuscl93",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco02aktb9k3yfc80x0",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco02altb9ksk574t53",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco02amtb9k0z78ay4e",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco02antb9kbrg0dbxz",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco02aotb9kkb2cegmb",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco02aptb9kclcgqem9",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1thgfn000rtbv8gg4tnhfa",
            "name": "Belok Kanan",
            "section": "GERAKAN BERJALAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdialcp02batb9kxml5mzt1",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcp02bbtb9kvzzf382f",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcp02bctb9kv4wj38og",
                "label": "KURANG",
                "score": 26,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcp02bdtb9knshl7qcd",
                "label": "CUKUP",
                "score": 31,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcp02betb9kgiu4b8yi",
                "label": "CUKUP",
                "score": 36,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcp02bftb9k56ua68a3",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcp02bgtb9kfu4qxppj",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcp02bhtb9ky7zauxr2",
                "label": "BAIK",
                "score": 51,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcp02bitb9kq9n7bnnq",
                "label": "BAIK",
                "score": 56,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcp02bjtb9klob1uu04",
                "label": "SANGAT BAIK",
                "score": 61,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1thuk4000utbv82gt2pmlb",
            "name": "Tiap-tiap Banjar 2x Belok Kiri",
            "section": "GERAKAN BERJALAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdialcq02c4tb9kuom2tabx",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02c5tb9k9px9fdwy",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02c6tb9kfdypb0j7",
                "label": "KURANG",
                "score": 26,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02c7tb9kw19umypo",
                "label": "CUKUP",
                "score": 31,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02c8tb9ktdk26jwt",
                "label": "CUKUP",
                "score": 36,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcq02c9tb9kaz3a70q2",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcq02catb9k47ofrtjt",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcq02cbtb9kxxz6zd1d",
                "label": "BAIK",
                "score": 51,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcq02cctb9kyafwolt4",
                "label": "BAIK",
                "score": 56,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02cdtb9kw9inu414",
                "label": "SANGAT BAIK",
                "score": 61,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1ti19p000xtbv8q7fqhbnu",
            "name": "Belok Kiri",
            "section": "GERAKAN BERJALAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 5,
            "options": [
              {
                "id": "cmtdialcq02cytb9krbpf7fyb",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02cztb9kkultzfr0",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02d0tb9kmy7u5r1k",
                "label": "KURANG",
                "score": 26,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02d1tb9kguma8ri5",
                "label": "CUKUP",
                "score": 31,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02d2tb9kas7l69mt",
                "label": "CUKUP",
                "score": 36,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcq02d3tb9k4ia6yw6b",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcq02d4tb9ksemwi74e",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcq02d5tb9ky1d2usp1",
                "label": "BAIK",
                "score": 51,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcq02d6tb9k99ce6lzq",
                "label": "BAIK",
                "score": 56,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02d7tb9kayvbk5yv",
                "label": "SANGAT BAIK",
                "score": 61,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tid790010tbv8335xlsew",
            "name": "Langkah Biasa Ke Langkah Tegap",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 6,
            "options": [
              {
                "id": "cmtdialcr02ditb9kktb62z3m",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02djtb9k8ubx4g8s",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02dktb9kh28a8mlu",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02dltb9ko7z0y7k5",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02dmtb9klgg4hjmc",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02dntb9kwazamn2j",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02dotb9kv3046jpt",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02dptb9ku01mq1pm",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02dqtb9kmeqwal28",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02drtb9kj2ej27z5",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tiia50013tbv8h9e7bwlt",
            "name": "Hormat Kanan",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 7,
            "options": [
              {
                "id": "cmtdialcr02e2tb9kfmoe04f8",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02e3tb9k8r0v3bfx",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02e4tb9k5o5zg6e9",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02e5tb9k0xp7osyv",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02e6tb9kcc853w1i",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02e7tb9k7mz8lfna",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02e8tb9k19y1w44r",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02e9tb9kwu2hc8m2",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02eatb9kbrde3c6w",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02ebtb9kin28wyw9",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tiu4b0016tbv853gg5azg",
            "name": "Langkah Tegap Ke Langkah Biasa",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 8,
            "options": [
              {
                "id": "cmtdialcr02emtb9kswpdm4sh",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02entb9ktr8hobv6",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02eotb9k1z5xcxz1",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02eptb9kvx6qzr2h",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02eqtb9kww639w7w",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02ertb9ka12v72mi",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02estb9kptj3sib5",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02ettb9kixy7cau4",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02eutb9k25ijm7lb",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02evtb9kxdcprfw7",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tjy75001ctbv8ga3q4vx2",
            "name": "Tiap-tiap Banjar 2x Belok Kanan",
            "section": "GERAKAN BERJALAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 9,
            "options": [
              {
                "id": "cmtdialcs02f6tb9kvxg1f3fe",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcs02f7tb9kcwn16ug7",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcs02f8tb9k9b0zpi8p",
                "label": "KURANG",
                "score": 26,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcs02f9tb9kqcpxaci3",
                "label": "CUKUP",
                "score": 31,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcs02fatb9kyry235vh",
                "label": "CUKUP",
                "score": 36,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcs02fbtb9kms3i00w4",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcs02fctb9kvqnqogfr",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcs02fdtb9kg7hu2h2l",
                "label": "BAIK",
                "score": 51,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcs02fetb9k8icf3fay",
                "label": "BAIK",
                "score": 56,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcs02fftb9kpr91dwfu",
                "label": "SANGAT BAIK",
                "score": 61,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tk8x9001ftbv8lgpappci",
            "name": "Melintang Kanan",
            "section": "GERAKAN BERJALAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 10,
            "options": [
              {
                "id": "cmtdialcs02fqtb9kf73xenpf",
                "label": "KURANG",
                "score": 19,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcs02frtb9kt6i48i7t",
                "label": "KURANG",
                "score": 25,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcs02fstb9kgvbc6rwe",
                "label": "KURANG",
                "score": 31,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcs02fttb9k9o24nsoy",
                "label": "CUKUP",
                "score": 37,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcs02futb9km5meckai",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcs02fvtb9kq51rowi8",
                "label": "CUKUP",
                "score": 49,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcs02fwtb9kfhb06i1n",
                "label": "BAIK",
                "score": 55,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcs02fxtb9kvh8mgk9o",
                "label": "BAIK",
                "score": 61,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcs02fytb9kjl47d4jk",
                "label": "BAIK",
                "score": 67,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcs02fztb9k2t370rnf",
                "label": "SANGAT BAIK",
                "score": 73,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tkers001itbv8ues4ve0m",
            "name": "Balik Kanan Maju",
            "section": "GERAKAN BERJALAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 11,
            "options": [
              {
                "id": "cmtdialcs02gatb9ksphaq9rp",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialct02gbtb9ksgk206rv",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialct02gctb9kbyalydnn",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialct02gdtb9kxzrbz96l",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialct02getb9kctfko3dp",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialct02gftb9kjx871gyf",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialct02ggtb9krtr22qeb",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialct02ghtb9kopeyhs3x",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialct02gitb9k61dcj9e5",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialct02gjtb9kywac0yc8",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tkpob001ltbv8c9oy3ron",
            "name": "Haluan Kanan",
            "section": "GERAKAN BERJALAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 12,
            "options": [
              {
                "id": "cmtdialct02gktb9kxf714csl",
                "label": "KURANG",
                "score": 19,
                "sortOrder": 0
              },
              {
                "id": "cmtdialct02gltb9k0viwaspt",
                "label": "KURANG",
                "score": 25,
                "sortOrder": 1
              },
              {
                "id": "cmtdialct02gmtb9kegui58jr",
                "label": "KURANG",
                "score": 31,
                "sortOrder": 2
              },
              {
                "id": "cmtdialct02gntb9kitbtojt4",
                "label": "CUKUP",
                "score": 37,
                "sortOrder": 3
              },
              {
                "id": "cmtdialct02gotb9k4ciw8qxt",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 4
              },
              {
                "id": "cmtdialct02gptb9k4detns8s",
                "label": "CUKUP",
                "score": 49,
                "sortOrder": 5
              },
              {
                "id": "cmtdialct02gqtb9krt04qegy",
                "label": "BAIK",
                "score": 55,
                "sortOrder": 6
              },
              {
                "id": "cmtdialct02grtb9kuathyncb",
                "label": "BAIK",
                "score": 61,
                "sortOrder": 7
              },
              {
                "id": "cmtdialct02gstb9k0je3c3w2",
                "label": "BAIK",
                "score": 67,
                "sortOrder": 8
              },
              {
                "id": "cmtdialct02gttb9k6h41qjsx",
                "label": "SANGAT BAIK",
                "score": 73,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1t9iqx0007tbv8lhwc4a6k",
        "name": "GERAKAN BERPINDAH TEMPAT",
        "percentage": 10,
        "sortOrder": 3,
        "criteria": [
          {
            "id": "cmt1tl3vx001otbv8ckgqehea",
            "name": "4 Langkah Ke Kanan",
            "section": "GERAKAN BERPINDAH TEMPAT",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdialco029mtb9kbwhrnbf9",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco029ntb9k0k6cpxys",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco029otb9k9bamcolp",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco029ptb9kj2dfrqnv",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco029qtb9kgilw7s4r",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco029rtb9kulcb5n1q",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco029stb9kc8w7qj5b",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco029ttb9ktria35kr",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco029utb9kno5u8w38",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco029vtb9ki4klq5mg",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tlakk001rtbv8ig5lkaz5",
            "name": "4 Langkah Ke Depan",
            "section": "GERAKAN BERPINDAH TEMPAT",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdialco02aqtb9kubfops9v",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco02artb9kbqk57pxi",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcp02astb9ke956aeny",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcp02attb9k9eiifbjn",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcp02autb9kputl24pk",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcp02avtb9k0nbjbg1l",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcp02awtb9kffbmcst1",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcp02axtb9k28zhsmwt",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcp02aytb9kwmcpoxnf",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcp02aztb9klh8faxym",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tljpe001utbv8w1tip34y",
            "name": "3 Langkah Ke Belakang",
            "section": "GERAKAN BERPINDAH TEMPAT",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdialcp02bktb9ky74ugybg",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcp02bltb9kco6wuj82",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcp02bmtb9kr35aer6h",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcp02bntb9k56wsy6lq",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcp02botb9kfsctqchs",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcp02bptb9k68oz9ina",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcp02bqtb9krg1lf8st",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcp02brtb9kuuktftrb",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcp02bstb9kedxxu2nw",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02bttb9khmviei96",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tlq85001xtbv8isyajujv",
            "name": "4 Langkah Ke Kiri",
            "section": "GERAKAN BERPINDAH TEMPAT",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdialcq02cetb9kv5iz2v7c",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02cftb9ktsb09gc3",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02cgtb9kgov0yrlq",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02chtb9kgs101csb",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02citb9k1bxxipsb",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcq02cjtb9kt952nhvx",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcq02cktb9kznd2x7qz",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcq02cltb9knbkzuj6s",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcq02cmtb9keg4zt36v",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02cntb9k25x7fu4f",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1t9zsl0009tbv8minj3blb",
        "name": "GERAKAN DITEMPAT",
        "percentage": 40,
        "sortOrder": 4,
        "criteria": [
          {
            "id": "cmt1tlzr20020tbv8iqpp003y",
            "name": "Hadap Serong Kanan",
            "section": "GERAKAN DITEMPAT",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdialcn028stb9kuvh83zjm",
                "label": "KURANG",
                "score": 9,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcn028ttb9k3q2gtsqr",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcn028utb9krctj70r5",
                "label": "KURANG",
                "score": 15,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcn028vtb9kp7vwow3j",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcn028wtb9ksbskcxwm",
                "label": "CUKUP",
                "score": 21,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcn028xtb9kpogn292p",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcn028ytb9ktymmgclq",
                "label": "BAIK",
                "score": 27,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcn028ztb9kj0866j9h",
                "label": "BAIK",
                "score": 30,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcn0290tb9kujrs9r4q",
                "label": "BAIK",
                "score": 33,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcn0291tb9krfilz9z5",
                "label": "SANGAT BAIK",
                "score": 36,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tm9810023tbv8w8dsfls3",
            "name": "Hormat",
            "section": "GERAKAN DITEMPAT",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdialco029wtb9k6i5fsgj9",
                "label": "KURANG",
                "score": 6,
                "sortOrder": 0
              },
              {
                "id": "cmtdialco029xtb9kj6bw4xpe",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialco029ytb9kwde01g4u",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 2
              },
              {
                "id": "cmtdialco029ztb9kujoxayxr",
                "label": "CUKUP",
                "score": 12,
                "sortOrder": 3
              },
              {
                "id": "cmtdialco02a0tb9kjwjzfid1",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 4
              },
              {
                "id": "cmtdialco02a1tb9kb29ds6qj",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 5
              },
              {
                "id": "cmtdialco02a2tb9k2yrwc9cn",
                "label": "BAIK",
                "score": 18,
                "sortOrder": 6
              },
              {
                "id": "cmtdialco02a3tb9kizjq5ich",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 7
              },
              {
                "id": "cmtdialco02a4tb9kt9x6kcy9",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 8
              },
              {
                "id": "cmtdialco02a5tb9km1wrpavb",
                "label": "SANGAT BAIK",
                "score": 24,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tmllo0026tbv8l134ygge",
            "name": "Istirahat (Parade)",
            "section": "GERAKAN DITEMPAT",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdialcp02b0tb9kshtid4uk",
                "label": "KURANG",
                "score": 6,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcp02b1tb9khhcqo6ez",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcp02b2tb9ko7h6m4s6",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcp02b3tb9k1zifhug8",
                "label": "CUKUP",
                "score": 12,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcp02b4tb9kpfsybbol",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcp02b5tb9knb67xkyj",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcp02b6tb9kz2b1nw36",
                "label": "BAIK",
                "score": 18,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcp02b7tb9kcujqkkgo",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcp02b8tb9k89qsoa4n",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcp02b9tb9koqmhlrl7",
                "label": "SANGAT BAIK",
                "score": 24,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tmtyh0029tbv8l14gni4g",
            "name": "Periksa Kerapihan",
            "section": "GERAKAN DITEMPAT",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdialcq02butb9khebnpdqx",
                "label": "KURANG",
                "score": 13,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02bvtb9k91tzw8z4",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02bwtb9kc22to5bh",
                "label": "KURANG",
                "score": 21,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02bxtb9kerv8wliw",
                "label": "CUKUP",
                "score": 25,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02bytb9k7vszvuml",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcq02bztb9k01ybucoz",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcq02c0tb9knp8a40u4",
                "label": "BAIK",
                "score": 37,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcq02c1tb9kgjfetgmf",
                "label": "BAIK",
                "score": 41,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcq02c2tb9kukibusi1",
                "label": "BAIK",
                "score": 45,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02c3tb9kiwd53ovu",
                "label": "SANGAT BAIK",
                "score": 49,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tn5w2002ctbv8nyle7oio",
            "name": "Balik Kanan Jalan Ditempat",
            "section": "GERAKAN DITEMPAT",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdialcq02cotb9kqvnuer7x",
                "label": "KURANG",
                "score": 9,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02cptb9krrr3vzq1",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02cqtb9kwin8ofm4",
                "label": "KURANG",
                "score": 15,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02crtb9k1t7bj16l",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02cstb9ke8win1e0",
                "label": "CUKUP",
                "score": 21,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcq02cttb9ko0q58b9t",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcq02cutb9k7l7vcudp",
                "label": "BAIK",
                "score": 27,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcq02cvtb9k8jhugvz6",
                "label": "BAIK",
                "score": 30,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcq02cwtb9ktd2ko4m4",
                "label": "BAIK",
                "score": 33,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcq02cxtb9k1t87yl7t",
                "label": "SANGAT BAIK",
                "score": 36,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1tnjuv002ftbv8n0kfowmf",
            "name": "Balik Kanan",
            "section": "GERAKAN DITEMPAT",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 5,
            "options": [
              {
                "id": "cmtdialcq02d8tb9kapuhddz3",
                "label": "KURANG",
                "score": 9,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcq02d9tb9k5tdtcdig",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcq02datb9k2j7tazhr",
                "label": "KURANG",
                "score": 15,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcq02dbtb9kyqarvmbv",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcq02dctb9kooz639rs",
                "label": "CUKUP",
                "score": 21,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02ddtb9kvf49nuio",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02detb9kjl9335ad",
                "label": "BAIK",
                "score": 27,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02dftb9kmo171zyl",
                "label": "BAIK",
                "score": 30,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02dgtb9kgpasj4tm",
                "label": "BAIK",
                "score": 33,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02dhtb9kehficuuy",
                "label": "SANGAT BAIK",
                "score": 36,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1u6wbj0001tbxo7hqm3767",
            "name": "Hadap Serong Kanan",
            "section": "GERAKAN DITEMPAT",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 6,
            "options": [
              {
                "id": "cmtdialcr02dstb9k4nxulaob",
                "label": "KURANG",
                "score": 9,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02dttb9kkbdqw5vw",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02dutb9kvfk6f4la",
                "label": "KURANG",
                "score": 15,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02dvtb9kqussg3ja",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02dwtb9ksb2ob9v1",
                "label": "CUKUP",
                "score": 21,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02dxtb9kywd7g2nc",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02dytb9kehi5hr0h",
                "label": "BAIK",
                "score": 27,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02dztb9k0m5zpjbl",
                "label": "BAIK",
                "score": 30,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02e0tb9kth5v8k0o",
                "label": "BAIK",
                "score": 33,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02e1tb9kcvkgvuyr",
                "label": "SANGAT BAIK",
                "score": 36,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1ulu3t000etbxo0jdv20yl",
            "name": "Lencang Depan",
            "section": "GERAKAN DITEMPAT",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 7,
            "options": [
              {
                "id": "cmtdialcr02ectb9kfeo6ssll",
                "label": "KURANG",
                "score": 6,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02edtb9kwnmrd0nv",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02eetb9kfv8nzehy",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02eftb9koc51zv81",
                "label": "CUKUP",
                "score": 12,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02egtb9k22jcd9ju",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02ehtb9kj07akm3n",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcr02eitb9kljq6rk71",
                "label": "BAIK",
                "score": 18,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcr02ejtb9khq831agm",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcr02ektb9kovhd4rpa",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcr02eltb9kaye9ium5",
                "label": "SANGAT BAIK",
                "score": 24,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1um0ii000htbxo6ntm7swv",
            "name": "Hitung",
            "section": "GERAKAN DITEMPAT",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 8,
            "options": [
              {
                "id": "cmtdialcr02ewtb9k8jy8eo0y",
                "label": "KURANG",
                "score": 6,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcr02extb9knx4a1noh",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcr02eytb9ksatcsiv3",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcr02eztb9kl4373o77",
                "label": "CUKUP",
                "score": 12,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcr02f0tb9kt5dlnbed",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcr02f1tb9koa9qqhip",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcs02f2tb9kbg6v8ynp",
                "label": "BAIK",
                "score": 18,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcs02f3tb9kyk0tkzd1",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcs02f4tb9krtdjqg1z",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcs02f5tb9kqdcl49iy",
                "label": "SANGAT BAIK",
                "score": 24,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1um62d000ktbxo84lckbbm",
            "name": "Hadap Kiri",
            "section": "GERAKAN DITEMPAT",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 9,
            "options": [
              {
                "id": "cmtdialcs02fgtb9ka3wzy529",
                "label": "KURANG",
                "score": 9,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcs02fhtb9kz29on922",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcs02fitb9k5ancif5b",
                "label": "KURANG",
                "score": 15,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcs02fjtb9khf8pghu4",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcs02fktb9kd1a76eu9",
                "label": "CUKUP",
                "score": 21,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcs02fltb9kqspziu5v",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcs02fmtb9k7cpl3jx3",
                "label": "BAIK",
                "score": 27,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcs02fntb9k8uu203k2",
                "label": "BAIK",
                "score": 30,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcs02fotb9kmbg1o5j7",
                "label": "BAIK",
                "score": 33,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcs02fptb9krz7wmpbf",
                "label": "SANGAT BAIK",
                "score": 36,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1umkux000ntbxolgxd1nsx",
            "name": "Bubar",
            "section": "GERAKAN DITEMPAT",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 10,
            "options": [
              {
                "id": "cmtdialcs02g0tb9klpout1be",
                "label": "KURANG",
                "score": 19,
                "sortOrder": 0
              },
              {
                "id": "cmtdialcs02g1tb9km1es88rg",
                "label": "KURANG",
                "score": 25,
                "sortOrder": 1
              },
              {
                "id": "cmtdialcs02g2tb9ki6z15e2o",
                "label": "KURANG",
                "score": 31,
                "sortOrder": 2
              },
              {
                "id": "cmtdialcs02g3tb9k4k5k5uoo",
                "label": "CUKUP",
                "score": 37,
                "sortOrder": 3
              },
              {
                "id": "cmtdialcs02g4tb9kz5tm1hp8",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 4
              },
              {
                "id": "cmtdialcs02g5tb9kfp9tw03r",
                "label": "CUKUP",
                "score": 49,
                "sortOrder": 5
              },
              {
                "id": "cmtdialcs02g6tb9ku6acesvs",
                "label": "BAIK",
                "score": 55,
                "sortOrder": 6
              },
              {
                "id": "cmtdialcs02g7tb9kcg99bcb5",
                "label": "BAIK",
                "score": 61,
                "sortOrder": 7
              },
              {
                "id": "cmtdialcs02g8tb9k5hnirfxt",
                "label": "BAIK",
                "score": 67,
                "sortOrder": 8
              },
              {
                "id": "cmtdialcs02g9tb9kjpwb1495",
                "label": "SANGAT BAIK",
                "score": 73,
                "sortOrder": 9
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cmtdghwg80001tbnkspqn34vg",
    "name": "PBB",
    "percentage": 60,
    "sortOrder": 1,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80006tb4oi44t3atr",
    "levelName": "SMA/SMK/MA",
    "subCategories": []
  },
  {
    "id": "cmt1uhya50007tbxoi6f0ifqx",
    "name": "KOMANDAN",
    "percentage": 10,
    "sortOrder": 2,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "levelName": "SMP/MTS",
    "subCategories": [
      {
        "id": "cmt1uwdq3000ptbxom7d5zhgq",
        "name": "KOMANDAN",
        "percentage": 100,
        "sortOrder": 0,
        "criteria": [
          {
            "id": "cmt1uwrc0000stbxoh8ne51tx",
            "name": "Sikap",
            "section": "KOMANDAN",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdialfc02gutb9kcasd9nvq",
                "label": "KURANG",
                "score": 5,
                "sortOrder": 0
              },
              {
                "id": "cmtdialfc02gvtb9kitw13bni",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 1
              },
              {
                "id": "cmtdialfc02gwtb9kqdf6iln0",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 2
              },
              {
                "id": "cmtdialfc02gxtb9ko30wpdxr",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 3
              },
              {
                "id": "cmtdialfc02gytb9kx2363dh6",
                "label": "CUKUP",
                "score": 17,
                "sortOrder": 4
              },
              {
                "id": "cmtdialfc02gztb9kdm0jes6p",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 5
              },
              {
                "id": "cmtdialfc02h0tb9k51fvjuqk",
                "label": "BAIK",
                "score": 23,
                "sortOrder": 6
              },
              {
                "id": "cmtdialfc02h1tb9kf5obr7wz",
                "label": "BAIK",
                "score": 26,
                "sortOrder": 7
              },
              {
                "id": "cmtdialfc02h2tb9k1ie5gad6",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 8
              },
              {
                "id": "cmtdialfc02h3tb9k535ckeog",
                "label": "SANGAT BAIK",
                "score": 32,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1uwxtw000vtbxon7sh9uhi",
            "name": "Suara",
            "section": "KOMANDAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdialfc02h4tb9keid91kvz",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 0
              },
              {
                "id": "cmtdialfc02h5tb9ktukunq3k",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialfc02h6tb9ke697fmlc",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 2
              },
              {
                "id": "cmtdialfc02h7tb9kdqjmvdb9",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdialfc02h8tb9kmtr2ndc0",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 4
              },
              {
                "id": "cmtdialfc02h9tb9kvoi3xv2j",
                "label": "CUKUP",
                "score": 28,
                "sortOrder": 5
              },
              {
                "id": "cmtdialfc02hatb9kwjt15ve2",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 6
              },
              {
                "id": "cmtdialfc02hbtb9kwj3zl9n8",
                "label": "BAIK",
                "score": 36,
                "sortOrder": 7
              },
              {
                "id": "cmtdialfc02hctb9k3v4u5bcn",
                "label": "BAIK",
                "score": 40,
                "sortOrder": 8
              },
              {
                "id": "cmtdialfc02hdtb9kz2dcu860",
                "label": "SANGAT BAIK",
                "score": 44,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1ux52g000ytbxodyugmqpx",
            "name": "Artikulasi",
            "section": "KOMANDAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdialfc02hetb9kzvilg5ro",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 0
              },
              {
                "id": "cmtdialfc02hftb9k8kw738dq",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 1
              },
              {
                "id": "cmtdialfc02hgtb9k6uqbh9nt",
                "label": "KURANG",
                "score": 16,
                "sortOrder": 2
              },
              {
                "id": "cmtdialfc02hhtb9kbggwbf75",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdialfc02hitb9kap95z8v5",
                "label": "CUKUP",
                "score": 24,
                "sortOrder": 4
              },
              {
                "id": "cmtdialfc02hjtb9khbxhn0s2",
                "label": "CUKUP",
                "score": 28,
                "sortOrder": 5
              },
              {
                "id": "cmtdialfc02hktb9k751tsaxy",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 6
              },
              {
                "id": "cmtdialfc02hltb9k2zgcr5xl",
                "label": "BAIK",
                "score": 36,
                "sortOrder": 7
              },
              {
                "id": "cmtdialfc02hmtb9kijt7nhr1",
                "label": "BAIK",
                "score": 40,
                "sortOrder": 8
              },
              {
                "id": "cmtdialfc02hntb9k7rvby9am",
                "label": "SANGAT BAIK",
                "score": 44,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1uxce10011tbxo10xtyk2q",
            "name": "Penguasaan Materi",
            "section": "KOMANDAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdialfc02hotb9k2unyfb9s",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdialfc02hptb9kczy79s9z",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialfd02hqtb9kspcldb70",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 2
              },
              {
                "id": "cmtdialfd02hrtb9klx280abm",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 3
              },
              {
                "id": "cmtdialfd02hstb9km57t80q5",
                "label": "CUKUP",
                "score": 35,
                "sortOrder": 4
              },
              {
                "id": "cmtdialfd02httb9k7fdssw7w",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialfd02hutb9kjbq9timi",
                "label": "BAIK",
                "score": 47,
                "sortOrder": 6
              },
              {
                "id": "cmtdialfd02hvtb9kcbt6peeh",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdialfd02hwtb9koh5295u6",
                "label": "BAIK",
                "score": 59,
                "sortOrder": 8
              },
              {
                "id": "cmtdialfd02hxtb9kjiureh69",
                "label": "SANGAT BAIK",
                "score": 65,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1uxliz0014tbxoca861v4o",
            "name": "Penguasaan Lapangan",
            "section": "KOMANDAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdialfd02hytb9k2lwcoa4i",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdialfd02hztb9klj3e439w",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 1
              },
              {
                "id": "cmtdialfd02i0tb9kfos4bjg6",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 2
              },
              {
                "id": "cmtdialfd02i1tb9k5om7wup7",
                "label": "CUKUP",
                "score": 29,
                "sortOrder": 3
              },
              {
                "id": "cmtdialfd02i2tb9ke0gcr4kb",
                "label": "CUKUP",
                "score": 35,
                "sortOrder": 4
              },
              {
                "id": "cmtdialfd02i3tb9kapon8u3w",
                "label": "CUKUP",
                "score": 41,
                "sortOrder": 5
              },
              {
                "id": "cmtdialfd02i4tb9k1q9r9jrh",
                "label": "BAIK",
                "score": 47,
                "sortOrder": 6
              },
              {
                "id": "cmtdialfd02i5tb9k4o6vlkoe",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdialfd02i6tb9kl7tu8b8h",
                "label": "BAIK",
                "score": 59,
                "sortOrder": 8
              },
              {
                "id": "cmtdialfd02i7tb9ketww8ses",
                "label": "SANGAT BAIK",
                "score": 65,
                "sortOrder": 9
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cmtdgxxyg0003tbnkrmswtyyv",
    "name": "TEST",
    "percentage": 40,
    "sortOrder": 2,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80006tb4oi44t3atr",
    "levelName": "SMA/SMK/MA",
    "subCategories": []
  },
  {
    "id": "cmt1uiaj80009tbxoy9iyogzh",
    "name": "VARIASI & FORMASI",
    "percentage": 30,
    "sortOrder": 3,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "levelName": "SMP/MTS",
    "subCategories": [
      {
        "id": "cmt1uzkjk0016tbxoa2q9qc4w",
        "name": "KREATIVITAS",
        "percentage": 10,
        "sortOrder": 0,
        "criteria": [
          {
            "id": "cmt1uzy270019tbxo6v3gerlp",
            "name": "Opening Variasi",
            "section": "KREATIVITAS",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02i8tb9kcxds2iax",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02i9tb9ki34ygi33",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02iatb9kzw9yvny5",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02ibtb9kgd6bet84",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02ictb9kdjrkw0qa",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02idtb9kqj5znsl5",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02ietb9kverfpeck",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02iftb9kpv96h21w",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02igtb9kxucl76hc",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02ihtb9ky32kz2ga",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v0hsp001ctbxolny8j3ko",
            "name": "Pembukaan Materi & Isi Pesan",
            "section": "KREATIVITAS",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzj02l0tb9kqfx7x7be",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02l1tb9kovovbznr",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02l2tb9kmfim1h6r",
                "label": "KURANG",
                "score": 34,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02l3tb9kouoci3be",
                "label": "CUKUP",
                "score": 40,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02l4tb9kqq2nk6n2",
                "label": "CUKUP",
                "score": 46,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02l5tb9k9pxbsuwx",
                "label": "CUKUP",
                "score": 52,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02l6tb9kt2q5803t",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02l7tb9kwx13mld3",
                "label": "BAIK",
                "score": 64,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02l8tb9ka6w5gzni",
                "label": "BAIK",
                "score": 70,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02l9tb9kk0buw4s5",
                "label": "SANGAT BAIK",
                "score": 76,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v150m001ftbxos8ko7hni",
            "name": "Penggunaan Alat bantu atau Pendukung",
            "section": "KREATIVITAS",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdiamzk02nstb9kzgtzi4zf",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02nttb9k4rhpoam5",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02nutb9kliprsoh6",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02nvtb9kmkea8yw4",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02nwtb9ktzmrllzo",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02nxtb9knegtc82x",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02nytb9kzg07awsr",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02nztb9kv87e089q",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02o0tb9kfp5hyhxf",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02o1tb9k7j9b4h7w",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1v2lyp001jtbxofu4qmbbr",
        "name": "DINAMIKA & STRUKTUR GERAKAN",
        "percentage": 10,
        "sortOrder": 1,
        "criteria": [
          {
            "id": "cmt1v3692001mtbxolkbxttoo",
            "name": "Kesesuaian Gerakan Dengan Isi Pesan",
            "section": "DINAMIKA & STRUKTUR GERAKAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02iitb9ky4jark38",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02ijtb9k2x0txzjz",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02iktb9ka5dyvt2j",
                "label": "KURANG",
                "score": 34,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02iltb9kjy5bkhp6",
                "label": "CUKUP",
                "score": 40,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02imtb9kzhas7x44",
                "label": "CUKUP",
                "score": 46,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02intb9knqtf3xd9",
                "label": "CUKUP",
                "score": 52,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02iotb9khgp1430l",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02iptb9kf4ic0iwd",
                "label": "BAIK",
                "score": 64,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02iqtb9kfncgw17u",
                "label": "BAIK",
                "score": 70,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02irtb9kcr345nko",
                "label": "SANGAT BAIK",
                "score": 76,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v3zh4001ptbxownmrof05",
            "name": "Etika, Kesopanan, & keamanan Gerakan",
            "section": "DINAMIKA & STRUKTUR GERAKAN",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzj02latb9ksa34jwb8",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02lbtb9ktyz1p0e5",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02lctb9kz6otiyie",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02ldtb9kp3nlrueh",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02letb9kd3k0f5xn",
                "label": "CUKUP",
                "score": 23,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02lftb9k2p5yhokw",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02lgtb9k2g6e8np1",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02lhtb9kmr3tzvus",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02litb9kmvp42esz",
                "label": "BAIK",
                "score": 35,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02ljtb9kip8hiva2",
                "label": "SANGAT BAIK",
                "score": 38,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v4nvr001stbxobewnt2ox",
            "name": "Tingkat Kesulitan & Detail Gerakan",
            "section": "DINAMIKA & STRUKTUR GERAKAN",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdiamzk02o2tb9kap5p0ikx",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02o3tb9kkagixytv",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02o4tb9kssy7sr4f",
                "label": "KURANG",
                "score": 34,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02o5tb9kj7dd8btj",
                "label": "CUKUP",
                "score": 40,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02o6tb9kq24slty1",
                "label": "CUKUP",
                "score": 46,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02o7tb9k90b81714",
                "label": "CUKUP",
                "score": 52,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02o8tb9kecxmaf9y",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02o9tb9kuxy7bci5",
                "label": "BAIK",
                "score": 64,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02oatb9kyg5wnerp",
                "label": "BAIK",
                "score": 70,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02obtb9kqjxpffoj",
                "label": "SANGAT BAIK",
                "score": 76,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v5b0v001vtbxo75gcapma",
            "name": "Kerapihan Shaft, Banjar, & Kekompakan gerakan",
            "section": "DINAMIKA & STRUKTUR GERAKAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdiamzl02p6tb9kv7enetgx",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzl02p7tb9k6ahxnt42",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzl02p8tb9kduluj6hz",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzl02p9tb9kx2g8xrjt",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzl02patb9k7t58vx06",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzl02pbtb9kdk2oebfj",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzl02pctb9kggb8m8e3",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzl02pdtb9kpdhkplnf",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzl02petb9knzwxivc0",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzl02pftb9k0ajrojkv",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v61kg001ytbxo94dtsssk",
            "name": "Kesesuain Format Barisan & Pengasaan Lapangan",
            "section": "DINAMIKA & STRUKTUR GERAKAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdiamzl02pgtb9kvjnqcxv8",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzl02phtb9kb5slbyin",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzl02pitb9k35ag642s",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzl02pjtb9khr67wqc6",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzl02pktb9kmncraxqj",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzl02pltb9k6k6ofgjb",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzl02pmtb9kcazn8d56",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzl02pntb9kcxz0qpl9",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzl02potb9kv6t6kbkh",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzl02pptb9kcbtsxkm0",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1v6cvy0020tbxo12gbyvho",
        "name": "PASUKAN",
        "percentage": 10,
        "sortOrder": 2,
        "criteria": [
          {
            "id": "cmt1v6xfs0023tbxoy5jjwisd",
            "name": "Penjiwaan, Sikap, Artikulasi, & Intonasi",
            "section": "PASUKAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02istb9kshhbc886",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02ittb9knj13f4dn",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02iutb9k4xpr7dd9",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02ivtb9kw45rhta0",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02iwtb9kyk0jifmt",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02ixtb9kb6jg6aiu",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02iytb9kx9kgrass",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02iztb9kskv0g5z3",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02j0tb9k6sa2orbi",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02j1tb9kl2jljqtx",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v7ftl0026tbxocik7b496",
            "name": "Penguasaan Materi & Semangat Kestabilan Penampilan",
            "section": "PASUKAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzj02lktb9k0rwizlau",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02lltb9kzuby10tx",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02lmtb9k133m8uey",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02lntb9khknvsce0",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02lotb9k4ud5sypp",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02lptb9kimqszoy2",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02lqtb9krdod2g9w",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02lrtb9kaaptg4rh",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02lstb9kmve9qi4a",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02lttb9kszc8ori0",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1v8anr0028tbxo4f9igf6i",
        "name": "KOMANDAN",
        "percentage": 10,
        "sortOrder": 3,
        "criteria": [
          {
            "id": "cmt1v8ycs002btbxoeozyu4yu",
            "name": "Penjiwaan, Sikap, Artikulasi, & Intonasi",
            "section": "KOMANDAN",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02j2tb9kflllxv1r",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02j3tb9kg3esgttn",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02j4tb9kvo0x1sk6",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02j5tb9kq0jpjx9e",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02j6tb9kz7g9x9zc",
                "label": "CUKUP",
                "score": 23,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02j7tb9kb41ef5yt",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02j8tb9k8i2jgotq",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02j9tb9knv2a7gcm",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02jatb9kyqfm3aqv",
                "label": "BAIK",
                "score": 35,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02jbtb9kb0hkm0bc",
                "label": "SANGAT BAIK",
                "score": 38,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1v9jpk002etbxo9olnxr6z",
            "name": "Semangat & Kestabilan Penampilan",
            "section": "KOMANDAN",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzj02lutb9k8r2n04on",
                "label": "KURANG",
                "score": 8,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02lvtb9kxe4odvpr",
                "label": "KURANG",
                "score": 10,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02lwtb9kirz69gcr",
                "label": "KURANG",
                "score": 12,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02lxtb9kyl2afps0",
                "label": "CUKUP",
                "score": 14,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02lytb9kdg5to5t1",
                "label": "CUKUP",
                "score": 16,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02lztb9kydmehack",
                "label": "CUKUP",
                "score": 18,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02m0tb9knt8izqgg",
                "label": "BAIK",
                "score": 20,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02m1tb9kq8kafdei",
                "label": "BAIK",
                "score": 22,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02m2tb9kof3mfhro",
                "label": "BAIK",
                "score": 24,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02m3tb9ks4k4gia7",
                "label": "SANGAT BAIK",
                "score": 26,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1va77n002htbxocbhy6evn",
            "name": "Penguasaan Lapangan, Materi & Aba-aba",
            "section": "KOMANDAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdiamzk02octb9kpp1zkb7c",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02odtb9kxpt1uoiz",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02oetb9kpalewii9",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02oftb9knx68aq7n",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02ogtb9kurbor92z",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02ohtb9kdlabenqc",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02oitb9kvjz5msxt",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02ojtb9kgo5kewhl",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02oktb9kesrzurbn",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02oltb9k69p4vyuq",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vbn6u002jtbxoz9qmtsw7",
        "name": "KREATIVITAS FORMASI",
        "percentage": 10,
        "sortOrder": 4,
        "criteria": [
          {
            "id": "cmt1vc4hh002mtbxojkz1b8dl",
            "name": "Pengembangan Isi Pesan & Pemilihan Kalimat",
            "section": "KREATIVITAS FORMASI",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02jctb9k828vv5k2",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02jdtb9kl4d5ot50",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02jetb9kzrwu8xcp",
                "label": "KURANG",
                "score": 34,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02jftb9ke04v83pp",
                "label": "CUKUP",
                "score": 40,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02jgtb9kguat9l2i",
                "label": "CUKUP",
                "score": 46,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02jhtb9kc9jfsa7g",
                "label": "CUKUP",
                "score": 52,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02jitb9kehwqbwli",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02jjtb9kzbme9ti5",
                "label": "BAIK",
                "score": 64,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02jktb9kv3deu00w",
                "label": "BAIK",
                "score": 70,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02jltb9k4w49nc37",
                "label": "SANGAT BAIK",
                "score": 76,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vco2z002otbxoko6hiwwz",
            "name": "Penggunaan Alat bantu atau Pendukung",
            "section": "KREATIVITAS FORMASI",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzj02m4tb9kto9ma54p",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02m5tb9k7zxi75pc",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02m6tb9kwkf6dulx",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02m7tb9k4v1eptn1",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02m8tb9kegctc8iv",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02m9tb9k6afwebe5",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02matb9ku5onneeu",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02mbtb9k6f4nz2jd",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02mctb9kc56ytbyp",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02mdtb9koggzj3gt",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vd96w002qtbxonvgx7jyq",
        "name": "DINAMIKA & STRUKTUR GERAKAN FORMASI",
        "percentage": 10,
        "sortOrder": 5,
        "criteria": [
          {
            "id": "cmt1vdk2t002stbxouplujwhc",
            "name": "Kesesuaian Gerakan Dengan Isi Pesan",
            "section": "DINAMIKA & STRUKTUR GERAKAN FORMASI",
            "interval": 6,
            "difficulty": "SULIT",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02jmtb9k4c1zjktc",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02jntb9k5rsswzu9",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzi02jotb9knf4lgtqw",
                "label": "KURANG",
                "score": 34,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzi02jptb9k9ve99rf9",
                "label": "CUKUP",
                "score": 40,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzi02jqtb9kiq9o4jgz",
                "label": "CUKUP",
                "score": 46,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzi02jrtb9kqvb69a47",
                "label": "CUKUP",
                "score": 52,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzi02jstb9kokxvbxho",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzi02jttb9ki53wl76a",
                "label": "BAIK",
                "score": 64,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzi02jutb9k6yu6yfy6",
                "label": "BAIK",
                "score": 70,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzi02jvtb9kgwfaptod",
                "label": "SANGAT BAIK",
                "score": 76,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vdr56002utbxo1693a65z",
            "name": "Etika, Kesopanan, & keamanan Gerakan",
            "section": "DINAMIKA & STRUKTUR GERAKAN FORMASI",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzk02metb9kuu0mn3qp",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02mftb9k2inyqi87",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02mgtb9k73q6mi24",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02mhtb9kjvpffv08",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02mitb9kyki1r0aq",
                "label": "CUKUP",
                "score": 23,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02mjtb9kecrgb66w",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02mktb9kntvq5chu",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02mltb9kiyl56hln",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02mmtb9k65bh7n3g",
                "label": "BAIK",
                "score": 35,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02mntb9k311ybi64",
                "label": "SANGAT BAIK",
                "score": 38,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1veyzw002ztbxo5fgpmrpx",
            "name": "Detail, Kerapihan, & Kekompakan Gerakan",
            "section": "DINAMIKA & STRUKTUR GERAKAN FORMASI",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdiamzk02omtb9kqdzvvq3v",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02ontb9ks1cde1fq",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02ootb9k9zxx6gle",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02optb9kjot9hi76",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02oqtb9kmuzjoun9",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02ortb9kjdsjn1ed",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzl02ostb9ko9x0fwi6",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzl02ottb9kxndn8nox",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzl02outb9kagtwajfa",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzl02ovtb9kjf4xgwh1",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vfmi70031tbxo7nak3how",
        "name": "PROSES BUKA TUTUP & BENTUK AKHIR FORMASI",
        "percentage": 10,
        "sortOrder": 6,
        "criteria": [
          {
            "id": "cmt1vgjbh0034tbxo530q1xj8",
            "name": "Kelurusan Barisan, Shaft, Banjar, Simetris Pada Bentuk Akhir",
            "section": "PROSES BUKA TUTUP & BENTUK AKHIR FORMASI",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzi02jwtb9k47gceocp",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzi02jxtb9k76zwn117",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02jytb9kq58gu8vk",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02jztb9k82jo4zrq",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02k0tb9kahzup7pf",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02k1tb9kdwbhxat8",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02k2tb9kybkbf5vs",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02k3tb9k0kt4ws4h",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02k4tb9kfgs87x4s",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02k5tb9kes5b4pkx",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vhkyn0037tbxo4qko87gz",
            "name": "Konfigurasi Tutup Formasi, Tingkat Kesulitan, & Penguasaan Penggunaan Lapangan",
            "section": "PROSES BUKA TUTUP & BENTUK AKHIR FORMASI",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzk02motb9k88w9l12h",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02mptb9ktwgiwkru",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02mqtb9k8xr4g0gz",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02mrtb9k3pus7ic3",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02mstb9kwbbcpys8",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02mttb9kn5xvf61j",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02mutb9kwqy2uqeq",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02mvtb9kb8r1daqm",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02mwtb9k46gutuxc",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02mxtb9kym2w7lpc",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vjhda003ftbxoe8qx0pyc",
        "name": "PASUKAN FORMASI",
        "percentage": 10,
        "sortOrder": 7,
        "criteria": [
          {
            "id": "cmt1vjpjg003htbxovs38etvq",
            "name": "Penjiwaan, Sikap, Artikulasi, & Intonasi",
            "section": "PASUKAN FORMASI",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzj02k6tb9knpwuvepu",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02k7tb9kivvy8sv5",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02k8tb9kv4dtmu5u",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02k9tb9koihu0cjg",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02katb9khiyxorod",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02kbtb9k1jxekl2o",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02kctb9k6ga7v591",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02kdtb9k042vfyxb",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02ketb9kdg9ake79",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02kftb9k51qaqx2u",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vjw2n003jtbxo0l5lkns9",
            "name": "Penguasaan Materi & Semangat Kestabilan Penampilan",
            "section": "PASUKAN FORMASI",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzk02mytb9kndtp7z3l",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02mztb9k03uscxg5",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02n0tb9k4ymm6soh",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02n1tb9kssfzs5x3",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02n2tb9kqtvwl22c",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02n3tb9kfcqeyxa7",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02n4tb9kqon0vt6n",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02n5tb9km6obxrqt",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02n6tb9kwi8k4fw3",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02n7tb9kziflb8ur",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vk6xy003ltbxol89omn27",
        "name": "KOMANDAN FORMASI",
        "percentage": 10,
        "sortOrder": 8,
        "criteria": [
          {
            "id": "cmt1vliq7003qtbxowm0q5vbi",
            "name": "Penjiwaan, Artikulasi & Intonasi",
            "section": "KOMANDAN FORMASI",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzj02kgtb9kdyhllub3",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02khtb9kn8i1pq13",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02kitb9ksc9hmsy2",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02kjtb9kba01bxap",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02kktb9keoz6jx3u",
                "label": "CUKUP",
                "score": 23,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02kltb9k5g6qkdqi",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02kmtb9kikq5w9kj",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02kntb9kod6tz24j",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02kotb9kakx1ochy",
                "label": "BAIK",
                "score": 35,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02kptb9kyez6ih7k",
                "label": "SANGAT BAIK",
                "score": 38,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vltc0003ttbxoctyx4f6f",
            "name": "Sikap & Olah Gerak",
            "section": "KOMANDAN FORMASI",
            "interval": 3,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzk02n8tb9koouiqp9r",
                "label": "KURANG",
                "score": 11,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02n9tb9k57a8kcig",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02natb9k3d0u9nnk",
                "label": "KURANG",
                "score": 17,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02nbtb9k18povsp8",
                "label": "CUKUP",
                "score": 20,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02nctb9k8klci3if",
                "label": "CUKUP",
                "score": 23,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02ndtb9klo3w8pxz",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02netb9kefhqmhej",
                "label": "BAIK",
                "score": 29,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02nftb9kjbv47jus",
                "label": "BAIK",
                "score": 32,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02ngtb9kmmgo2t9p",
                "label": "BAIK",
                "score": 35,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02nhtb9kfk70f2su",
                "label": "SANGAT BAIK",
                "score": 38,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vm7lo003wtbxo49xcdrd2",
            "name": "Penguasaan Lapangan, Materi & Aba-aba",
            "section": "KOMANDAN FORMASI",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdiamzl02owtb9ksfxc65pv",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzl02oxtb9ktizjdwtk",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzl02oytb9k289rdqmv",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzl02oztb9k1no2cnfi",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzl02p0tb9khnxs8nbv",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzl02p1tb9kmny6f5hd",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzl02p2tb9kfr9hcq7a",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzl02p3tb9k57vzuuft",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzl02p4tb9kopdysvx6",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzl02p5tb9kjp01ffg8",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vmqme003ytbxo6029hhc6",
        "name": "KESELURUHAN PENAMPILAN",
        "percentage": 10,
        "sortOrder": 9,
        "criteria": [
          {
            "id": "cmt1vn52g0041tbxoy65kr9m0",
            "name": "Semangat & Kestabilan Penampilan",
            "section": "KESELURUHAN PENAMPILAN",
            "interval": 4,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdiamzj02kqtb9kc4pwu4uv",
                "label": "KURANG",
                "score": 14,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzj02krtb9kcm4w9tv7",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzj02kstb9kpnhpwvdg",
                "label": "KURANG",
                "score": 22,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzj02kttb9kln2q06uv",
                "label": "CUKUP",
                "score": 26,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzj02kutb9k27tiif49",
                "label": "CUKUP",
                "score": 30,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzj02kvtb9kko82ayom",
                "label": "CUKUP",
                "score": 34,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzj02kwtb9kpkzhha6j",
                "label": "BAIK",
                "score": 38,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzj02kxtb9kb5pqk57i",
                "label": "BAIK",
                "score": 42,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzj02kytb9kzt6suhbf",
                "label": "BAIK",
                "score": 46,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzj02kztb9kevftt03f",
                "label": "SANGAT BAIK",
                "score": 50,
                "sortOrder": 9
              }
            ]
          },
          {
            "id": "cmt1vntdc0044tbxo70e1rb26",
            "name": "Ending Celebration (Setelah Tutup Formasi)",
            "section": "KESELURUHAN PENAMPILAN",
            "interval": 5,
            "difficulty": "SULIT",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdiamzk02nitb9kn5fsk4kl",
                "label": "KURANG",
                "score": 18,
                "sortOrder": 0
              },
              {
                "id": "cmtdiamzk02njtb9kxnzyvmaj",
                "label": "KURANG",
                "score": 23,
                "sortOrder": 1
              },
              {
                "id": "cmtdiamzk02nktb9keyrym4lq",
                "label": "KURANG",
                "score": 28,
                "sortOrder": 2
              },
              {
                "id": "cmtdiamzk02nltb9kl7x7azts",
                "label": "CUKUP",
                "score": 33,
                "sortOrder": 3
              },
              {
                "id": "cmtdiamzk02nmtb9kxu6s585c",
                "label": "CUKUP",
                "score": 38,
                "sortOrder": 4
              },
              {
                "id": "cmtdiamzk02nntb9krbb2gkji",
                "label": "CUKUP",
                "score": 43,
                "sortOrder": 5
              },
              {
                "id": "cmtdiamzk02notb9ki79q5aef",
                "label": "BAIK",
                "score": 48,
                "sortOrder": 6
              },
              {
                "id": "cmtdiamzk02nptb9kp4el62ey",
                "label": "BAIK",
                "score": 53,
                "sortOrder": 7
              },
              {
                "id": "cmtdiamzk02nqtb9k2rqvqpn8",
                "label": "BAIK",
                "score": 58,
                "sortOrder": 8
              },
              {
                "id": "cmtdiamzk02nrtb9kgvf31es5",
                "label": "SANGAT BAIK",
                "score": 63,
                "sortOrder": 9
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cmt1voprq0046tbxo4gc2raan",
    "name": "KOSTUM",
    "percentage": 2.5,
    "sortOrder": 4,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "levelName": "SMP/MTS",
    "subCategories": [
      {
        "id": "cmt1vqn9w004atbxoj1dwmfz2",
        "name": "A",
        "percentage": 30,
        "sortOrder": 0,
        "criteria": [
          {
            "id": "cmt1vrkxv004jtbxouwgfimp8",
            "name": "Konsep / Tema",
            "section": "A",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdian0a02pqtb9k1yquf63w",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02prtb9k5sslt3pd",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02pstb9k278cuy7x",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vrx23004mtbxoc8735v27",
            "name": "Kreativitas / Keunikan",
            "section": "A",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdian0a02q2tb9khz8aarvv",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02q3tb9k676tff9t",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02q4tb9kb8tx817q",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vs3mo004ptbxovay06ewp",
            "name": "Body Fit",
            "section": "A",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdian0b02qetb9k4upydh91",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qftb9ki4kymo5h",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qgtb9k8r14uhf4",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vsb1q004stbxo8k9q94e8",
            "name": "Variasi Topi",
            "section": "A",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdian0b02qqtb9ksajhn80w",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qrtb9k89lgakxm",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qstb9k1x7e4k4l",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vqvcu004ctbxogka6pshr",
        "name": "B",
        "percentage": 30,
        "sortOrder": 1,
        "criteria": [
          {
            "id": "cmt1vsmyh004vtbxox9gjtu5v",
            "name": "Keserasian Pria & Wanita",
            "section": "B",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdian0a02pttb9kg87wv0q2",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02putb9kbfllm2hs",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02pvtb9kx5ci8q9b",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vt24k004ytbxoos3kt4jd",
            "name": "Material Baju / Pemilihan Bahan",
            "section": "B",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdian0a02q5tb9klbj11d03",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02q6tb9kt86vn30i",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02q7tb9k1m8o8o5l",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vt88x0051tbxoyyki00j4",
            "name": "Kondisi Bahan",
            "section": "B",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdian0b02qhtb9kmlkm4219",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qitb9kwv1ggavk",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qjtb9kqwqjh9aw",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vtg6m0054tbxoooj1q41j",
            "name": "Kenyamanan Kostum",
            "section": "B",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdian0b02qttb9kpxmfdhse",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qutb9kgpgn5da3",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qvtb9kf92jr28i",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vr30p004etbxoiryv2fc5",
        "name": "C",
        "percentage": 20,
        "sortOrder": 2,
        "criteria": [
          {
            "id": "cmt1vtp9v0057tbxoqss46d86",
            "name": "Perpaduan Warna",
            "section": "C",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdian0a02pwtb9kvoop2xgh",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02pxtb9kk17o8twg",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02pytb9kzthzmbfq",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vu538005atbxomsnryhh1",
            "name": "Kelayakan Aksesoris Atribut / Non Atribut",
            "section": "C",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdian0b02q8tb9k6hi57as9",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02q9tb9krv76a5os",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qatb9kdzz35jcb",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vuku5005dtbxon1obfky7",
            "name": "Korelasi Kostum & Vafor",
            "section": "C",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdian0b02qktb9kxffmec97",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qltb9kuz7mbm0y",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qmtb9km1jrg8mq",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vv8e9005jtbxoe4xpvpl4",
            "name": "Korelasi Kostum & Make Up",
            "section": "C",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdian0b02qwtb9kc5r02cq5",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qxtb9kxovj64b5",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qytb9keg3axtxq",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          }
        ]
      },
      {
        "id": "cmt1vr7kd004gtbxosckunxls",
        "name": "D",
        "percentage": 20,
        "sortOrder": 3,
        "criteria": [
          {
            "id": "cmt1vvi3j005mtbxoml1dq0wf",
            "name": "Kelayakan Sepatu",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdian0a02pztb9kevmfhv0a",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0a02q0tb9k9x6rnq2f",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0a02q1tb9kd472zxwu",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vw5nv005ptbxowcsgi9v2",
            "name": "Kelayakan Aksesoris Atribut / Non Atribut",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdian0b02qbtb9k0mawpz2t",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qctb9k3asp858d",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qdtb9kvb3uoy74",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vwsc4005ytbxoj30atjod",
            "name": "Kelayakan Kopel / Sabuk / Ikat Pinggang",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdian0b02qntb9kz76qohrm",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02qotb9kvmq6fmbm",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02qptb9kwouxhu7r",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vx4iz0061tbxowxzwn0lw",
            "name": "Kerapihan & Kebersihan Kostum",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdian0b02qztb9k32qsergp",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02r0tb9kwjio7uya",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02r1tb9k415p2job",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vxmo60064tbxo0sb419xg",
            "name": "Kepantasan / Kesopanan (Etika)",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdian0b02r2tb9kr43qnfv0",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02r3tb9kgq1ckk6j",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02r4tb9k6mi57wse",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          },
          {
            "id": "cmt1vxvwo0067tbxoyl34hczy",
            "name": "Kostum Komandan",
            "section": "D",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 5,
            "options": [
              {
                "id": "cmtdian0b02r5tb9kzhlj1263",
                "label": "KURANG",
                "score": 2,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0b02r6tb9kb3b3tvju",
                "label": "CUKUP",
                "score": 4,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0b02r7tb9kk4vqdnj9",
                "label": "BAIK",
                "score": 6,
                "sortOrder": 2
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "cmt1vowqn0048tbxo7o0w8li8",
    "name": "MAKE UP",
    "percentage": 2.5,
    "sortOrder": 5,
    "eventId": "cmt1t1kzd0002tba86ao0a6vu",
    "eventLevelId": "cmt2br2w80003tb4otaxhdave",
    "levelName": "SMP/MTS",
    "subCategories": [
      {
        "id": "cmt1vyg4z0069tbxowidhjt4f",
        "name": "PENILAIAN MAKE UP",
        "percentage": 100,
        "sortOrder": 0,
        "criteria": [
          {
            "id": "cmt1vz7vu006ctbxoxfpqd14n",
            "name": "Kesesuaian Warna Foundation",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 0,
            "options": [
              {
                "id": "cmtdian0r02r8tb9ktav3ns8n",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0r02r9tb9kofz90f3m",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0r02ratb9kwjqfq3zr",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0r02rbtb9kghqykkrm",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0r02rctb9kjqqfqzn0",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0r02rdtb9khuw9g1ms",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0r02retb9kvllbr8fv",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1vzfo0006ftbxo7549mmq9",
            "name": "Kehalusan Bedak",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 1,
            "options": [
              {
                "id": "cmtdian0r02rftb9kosavpm7k",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0r02rgtb9ksf91vvts",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0r02rhtb9klf6yy85h",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0r02ritb9kjg0uv8zh",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0r02rjtb9k8py2gan6",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0r02rktb9k559a9anh",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0r02rltb9kvjnf37vu",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w038k006itbxoyar9zag8",
            "name": "Kerapihan Kontur Luar & Dalam",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 2,
            "options": [
              {
                "id": "cmtdian0r02rmtb9klbgs3hoy",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0r02rntb9kta4wqa7v",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0r02rotb9kimyhmuc7",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0r02rptb9kx40fll2a",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0r02rqtb9kws57d9of",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0r02rrtb9kyc4lydpc",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0r02rstb9kknok71hx",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w0nz9006ltbxoutqu9s2r",
            "name": "Kerapihan & Bauran Eyeshadow",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 3,
            "options": [
              {
                "id": "cmtdian0r02rttb9ksilk8g36",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0r02rutb9k9pc8txmu",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0r02rvtb9khypucy55",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02rwtb9k1v0p57f3",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02rxtb9k32isdk72",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02rytb9kcz5jopdz",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02rztb9kgnnmxi7o",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w13ir006otbxo0ze9r5m2",
            "name": "Kerapihan & Ketajaman Garis Alis",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 4,
            "options": [
              {
                "id": "cmtdian0s02s0tb9kiu49o1cm",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0s02s1tb9kvkbnu55q",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0s02s2tb9kxzjmyz7q",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02s3tb9kvvgs9kh0",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02s4tb9kehpo9zny",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02s5tb9k00etsfup",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02s6tb9kd124zslb",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w1jms006rtbxoch5tw958",
            "name": "Kerapihan & Ketepatan Aplikasi Bulu Mata",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 5,
            "options": [
              {
                "id": "cmtdian0s02s7tb9k53pdt6ye",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0s02s8tb9koxhnoac9",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0s02s9tb9klvl964iz",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02satb9kalv8hr75",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02sbtb9k78thcz0q",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02sctb9kugyiceiy",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02sdtb9kfhz2v3y3",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w1vn4006utbxowm8i1zl0",
            "name": "Kerapihan Blush On",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 6,
            "options": [
              {
                "id": "cmtdian0s02setb9kqbx07tmo",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0s02sftb9kcfgwo8e8",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0s02sgtb9k1qc3spvt",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02shtb9kz9oudrdh",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02sitb9k97yh2xih",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02sjtb9kx199gz3h",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02sktb9kcdx0gzv7",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w2343006xtbxoif2fncez",
            "name": "Kerapihan Garis Bibir",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 7,
            "options": [
              {
                "id": "cmtdian0s02sltb9kvu4kx2pb",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0s02smtb9kpc9z2l1w",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0s02sntb9kxim0hobx",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02sotb9kj1e0axza",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02sptb9kmzjnrm4q",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02sqtb9kx77nv2d9",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02srtb9kgjl1im12",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          },
          {
            "id": "cmt1w2j800070tbxoaxdikqhx",
            "name": "Kerapihan Total Look Make Up",
            "section": "PENILAIAN MAKE UP",
            "interval": 2,
            "difficulty": "MUDAH",
            "sortOrder": 8,
            "options": [
              {
                "id": "cmtdian0s02sstb9kete59fxa",
                "label": "KURANG",
                "score": 1,
                "sortOrder": 0
              },
              {
                "id": "cmtdian0s02sttb9k7bssxz82",
                "label": "CUKUP",
                "score": 3,
                "sortOrder": 1
              },
              {
                "id": "cmtdian0s02sutb9knqoqdzdw",
                "label": "CUKUP",
                "score": 5,
                "sortOrder": 2
              },
              {
                "id": "cmtdian0s02svtb9kjnt7f3l2",
                "label": "CUKUP",
                "score": 7,
                "sortOrder": 3
              },
              {
                "id": "cmtdian0s02swtb9kd3k0nfkz",
                "label": "BAIK",
                "score": 9,
                "sortOrder": 4
              },
              {
                "id": "cmtdian0s02sxtb9ktzitizp2",
                "label": "BAIK",
                "score": 11,
                "sortOrder": 5
              },
              {
                "id": "cmtdian0s02sytb9k9gr9hjfn",
                "label": "SANGAT BAIK",
                "score": 13,
                "sortOrder": 6
              }
            ]
          }
        ]
      }
    ]
  }
];
