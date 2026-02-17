'use client';

import { Badge } from '@/components/ui/badge';
import { IdeaCard } from '@/components/idea-card';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { IdeaProduct } from '@/types';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

interface IdeasClientProps {
  ideas: IdeaProduct[];
}

export function IdeasClient({ ideas }: IdeasClientProps) {
  return (
    <div className="bg-gradient-to-b from-white via-blue-50/20 to-white min-h-screen">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent pointer-events-none" />

        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-96 h-96 bg-gradient-to-tr from-indigo-200/25 to-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-900 border-blue-200/50 px-6 py-2 text-sm font-medium mb-6 shadow-sm">
                  <Lightbulb className="w-4 h-4 mr-2 inline" />
                  Community Ideas
                </Badge>
              </motion.div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight">
                応募されたIDEA
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                みんなが投稿した商品アイデアをチェック。あなたのアイデアも応募してみませんか？
              </p>
            </motion.div>

            {ideas.length === 0 ? (
              <motion.div
                className="text-center py-20"
                variants={fadeInUp}
              >
                <Lightbulb className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <p className="text-xl text-gray-500 mb-4">まだ応募されたIDEAがありません</p>
                <p className="text-gray-400">あなたが最初の投稿者になりませんか？</p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={staggerContainer}
              >
                {ideas.map((idea, index) => (
                  <motion.div
                    key={idea.slug}
                    variants={fadeInUp}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <IdeaCard idea={idea} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
