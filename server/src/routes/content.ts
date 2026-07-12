import express from 'express';
import fs from 'fs';
import path from 'path';
import { success, error as apiError, ErrorCode } from '../utils/response';
import { rebuildIndex, rebuildStatus } from '../upload-docs';

const router = express.Router();

const CONTENT_ROOT = path.join(__dirname, '../../../content/active');

function countMdFiles(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countMdFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      count++;
    }
  }
  return count;
}

function countProjects(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
    .length;
}

router.get('/stats', (req, res) => {
  try {
    const kbPath = path.join(CONTENT_ROOT, '01-knowledge-base');
    const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
    const sourcePath = path.join(CONTENT_ROOT, '03-source-notes');

    const kbDocCount = countMdFiles(kbPath);
    const projectCount = countProjects(projectsPath);
    const sourceDocCount = countMdFiles(sourcePath);
    const totalDocs = kbDocCount + sourceDocCount;

    res.json(success({
      knowledgeBase: {
        docCount: kbDocCount,
        categoryCount: getCategories(kbPath).length,
      },
      learningProjects: {
        projectCount,
      },
      sourceNotes: {
        docCount: sourceDocCount,
        categoryCount: getCategories(sourcePath).length,
      },
      total: {
        docCount: totalDocs,
        projectCount,
      },
    }));
  } catch (error) {
    console.error('Error getting content stats:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get stats'));
  }
});

// ==================== Rebuild Index ====================

router.get('/rebuild-status', (req, res) => {
  res.json(success({
    isRunning: rebuildStatus.isRunning,
    mode: rebuildStatus.mode,
    startTime: rebuildStatus.startTime,
    endTime: rebuildStatus.endTime,
    progress: rebuildStatus.progress,
    lastResult: rebuildStatus.lastResult,
  }));
});

router.post('/rebuild', (req, res) => {
  if (rebuildStatus.isRunning) {
    return res.status(409).json(apiError(ErrorCode.INTERNAL_ERROR, 'Index rebuild is already in progress'));
  }

  const mode = (req.body?.mode || 'simple') as 'simple' | 'semantic';

  rebuildIndex(mode).catch((err) => {
    console.error('Rebuild index error:', err);
  });

  res.json(success({
    message: 'Index rebuild started',
    mode,
  }));
});

interface CategoryInfo {
  id: string;
  name: string;
  docCount: number;
}

interface DocInfo {
  path: string;
  title: string;
  category: string;
}

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  level: string;
  status: string;
  coverImage: string | null;
  noteCount: number;
  demoCount: number;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function stripNumberPrefix(name: string): string {
  return name.replace(/^\d+[-_]/, '');
}

function getCategories(dirPath: string): CategoryInfo[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(dirent =>
      dirent.isDirectory()
      && !dirent.name.startsWith('.')
      && !dirent.name.startsWith('_')
    )
    .map(dirent => {
      const categoryPath = path.join(dirPath, dirent.name);
      const docCount = fs.existsSync(categoryPath)
        ? fs.readdirSync(categoryPath).filter(f => f.endsWith('.md')).length
        : 0;
      return {
        id: dirent.name,
        name: stripNumberPrefix(dirent.name),
        docCount,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getDocsFromCategory(dirPath: string, category: string): DocInfo[] {
  const categoryPath = path.join(dirPath, category);
  if (!fs.existsSync(categoryPath)) return [];

  return fs.readdirSync(categoryPath)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(categoryPath, file);
      let content = '';
      try {
        content = fs.readFileSync(filePath, 'utf-8');
      } catch {
        // ignore
      }
      return {
        path: `${category}/${file}`,
        title: extractTitle(content) || file.replace('.md', ''),
        category,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

function readMarkdownFile(basePath: string, relativePath: string): { content: string; title: string } | null {
  const fullPath = path.join(basePath, relativePath);

  if (!fs.existsSync(fullPath)) return null;

  const content = fs.readFileSync(fullPath, 'utf-8');
  const title = extractTitle(content);
  return { content, title };
}

// ==================== Knowledge Base ====================

router.get('/knowledge-base/categories', (req, res) => {
  try {
    const kbPath = path.join(CONTENT_ROOT, '01-knowledge-base');
    const categories = getCategories(kbPath);
    res.json(success({ categories }));
  } catch (error) {
    console.error('Error getting knowledge base categories:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get categories'));
  }
});

router.get('/knowledge-base/docs', (req, res) => {
  try {
    const { category } = req.query;
    const kbPath = path.join(CONTENT_ROOT, '01-knowledge-base');

    if (!category) {
      return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, 'category is required'));
    }

    const docs = getDocsFromCategory(kbPath, category as string);
    res.json(success({ docs, totalCount: docs.length }));
  } catch (error) {
    console.error('Error getting knowledge base docs:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get documents'));
  }
});

router.get('/knowledge-base/doc/*', (req, res) => {
  try {
    const docPath = (req.params as any)[0] as string;
    const kbPath = path.join(CONTENT_ROOT, '01-knowledge-base');
    const result = readMarkdownFile(kbPath, docPath);

    if (!result) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Document not found'));
    }

    res.json(success({
      path: docPath,
      title: result.title,
      content: result.content,
    }));
  } catch (error) {
    console.error('Error getting knowledge base doc:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get document'));
  }
});

// ==================== Learning Projects ====================

router.get('/learning-projects/list', (req, res) => {
  try {
    const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
    if (!fs.existsSync(projectsPath)) {
      return res.json(success({ projects: [], totalCount: 0 }));
    }

    const projectDirs = fs.readdirSync(projectsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

    const projects: ProjectInfo[] = [];

    for (const dirent of projectDirs) {
      const manifestPath = path.join(projectsPath, dirent.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        projects.push({
          id: manifest.id || dirent.name,
          title: manifest.title || dirent.name,
          description: manifest.description || '',
          tags: manifest.tags || [],
          level: manifest.level || 'beginner',
          status: manifest.status || 'not-started',
          coverImage: manifest.coverImage || null,
          noteCount: (manifest.notes || []).length,
          demoCount: (manifest.demos || []).length,
        });
      } catch {
        // skip invalid manifests
      }
    }

    res.json(success({ projects, totalCount: projects.length }));
  } catch (error) {
    console.error('Error getting learning projects list:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get projects'));
  }
});

router.get('/learning-projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
    const projectPath = path.join(projectsPath, id);
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Project not found'));
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    let readme = '';
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      readme = fs.readFileSync(readmePath, 'utf-8');
    }

    res.json(success({
      id,
      manifest,
      readme,
    }));
  } catch (error) {
    console.error('Error getting learning project:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get project'));
  }
});

router.get('/learning-projects/:id/note/:noteId', (req, res) => {
  try {
    const { id, noteId } = req.params;
    const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
    const projectPath = path.join(projectsPath, id);
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Project not found'));
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const note = (manifest.notes || []).find((n: any) => n.id === noteId);

    if (!note) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Note not found'));
    }

    const notePath = path.join(projectPath, note.file);
    if (!fs.existsSync(notePath)) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Note file not found'));
    }

    const content = fs.readFileSync(notePath, 'utf-8');
    const title = extractTitle(content) || note.title;

    res.json(success({
      id: noteId,
      title,
      content,
      file: note.file,
    }));
  } catch (error) {
    console.error('Error getting project note:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get note'));
  }
});

router.get('/learning-projects/:id/demo/:demoId', (req, res) => {
  try {
    const { id, demoId } = req.params;
    const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
    const projectPath = path.join(projectsPath, id);
    const manifestPath = path.join(projectPath, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Project not found'));
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const demo = (manifest.demos || []).find((d: any) => d.id === demoId);

    if (!demo) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Demo not found'));
    }

    res.json(success({
      id: demoId,
      title: demo.title,
      description: demo.description || '',
      entry: demo.entry,
      projectId: id,
    }));
  } catch (error) {
    console.error('Error getting project demo:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get demo'));
  }
});

// 静态文件服务：demo 相关的静态资源
router.use('/learning-projects-static/:id', (req, res, next) => {
  const { id } = req.params;
  const projectsPath = path.join(CONTENT_ROOT, '02-learning-projects');
  const projectPath = path.join(projectsPath, id);

  if (!fs.existsSync(projectPath)) {
    return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Project not found'));
  }

  express.static(projectPath)(req, res, next);
});

// ==================== Source Notes ====================

router.get('/source-notes/categories', (req, res) => {
  try {
    const snPath = path.join(CONTENT_ROOT, '03-source-notes');
    const categories = getCategories(snPath);
    res.json(success({ categories }));
  } catch (error) {
    console.error('Error getting source notes categories:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get categories'));
  }
});

router.get('/source-notes/docs', (req, res) => {
  try {
    const { category } = req.query;
    const snPath = path.join(CONTENT_ROOT, '03-source-notes');

    if (!category) {
      return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, 'category is required'));
    }

    const docs = getDocsFromCategory(snPath, category as string);
    res.json(success({ docs, totalCount: docs.length }));
  } catch (error) {
    console.error('Error getting source notes docs:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get documents'));
  }
});

router.get('/source-notes/doc/*', (req, res) => {
  try {
    const docPath = (req.params as any)[0] as string;
    const snPath = path.join(CONTENT_ROOT, '03-source-notes');
    const result = readMarkdownFile(snPath, docPath);

    if (!result) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Document not found'));
    }

    res.json(success({
      path: docPath,
      title: result.title,
      content: result.content,
    }));
  } catch (error) {
    console.error('Error getting source notes doc:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get document'));
  }
});

// ==================== Pending Notes (待整理) ====================

const PENDING_DIR = path.join(CONTENT_ROOT, '03-source-notes', '_pending');

interface PendingNote {
  filename: string
  title: string
  sourceUrl?: string
  template?: string
  createdAt: number
  content: string
}

function ensurePendingDir() {
  if (!fs.existsSync(PENDING_DIR)) {
    fs.mkdirSync(PENDING_DIR, { recursive: true });
  }
}

function safeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 100);
}

router.get('/pending-notes/list', (req, res) => {
  try {
    ensurePendingDir();
    const files = fs.readdirSync(PENDING_DIR)
      .filter(f => f.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(PENDING_DIR, filename);
        const stat = fs.statSync(filePath);
        let content = '';
        try {
          content = fs.readFileSync(filePath, 'utf-8');
        } catch { /* ignore */ }

        let sourceUrl = '';
        let template = '';
        let noteTitle = '';
        const titleMatch = content.match(/^title:\s*(.+)$/m);
        const urlMatch = content.match(/^source:\s*(.+)$/m);
        const tplMatch = content.match(/^template:\s*(.+)$/m);
        if (titleMatch) noteTitle = titleMatch[1].trim();
        if (urlMatch) sourceUrl = urlMatch[1].trim();
        if (tplMatch) template = tplMatch[1].trim();

        return {
          filename,
          title: noteTitle || extractTitle(content) || filename.replace('.md', ''),
          sourceUrl,
          template,
          createdAt: stat.birthtimeMs || stat.ctimeMs,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(success({ notes: files, totalCount: files.length }));
  } catch (error) {
    console.error('Error listing pending notes:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to list pending notes'));
  }
});

router.get('/pending-notes/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const safeName = safeFilename(filename);
    const filePath = path.join(PENDING_DIR, safeName);

    if (!fs.existsSync(filePath) || !safeName.endsWith('.md')) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Note not found'));
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    res.json(success({
      filename: safeName,
      content,
      title: extractTitle(content),
    }));
  } catch (error) {
    console.error('Error getting pending note:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to get note'));
  }
});

router.post('/pending-notes/save', (req, res) => {
  try {
    const { title, content, sourceUrl, template } = req.body || {};

    if (!content || !content.trim()) {
      return res.status(400).json(apiError(ErrorCode.BAD_REQUEST, '内容不能为空'));
    }

    ensurePendingDir();

    const noteTitle = (title || '未命名笔记').trim();
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseName = safeFilename(`${timestamp}_${noteTitle}`);
    let filename = `${baseName}.md`;
    let counter = 1;

    while (fs.existsSync(path.join(PENDING_DIR, filename))) {
      filename = `${baseName}_${counter}.md`;
      counter++;
    }

    const frontmatterLines = [
      '---',
      `title: ${noteTitle}`,
      sourceUrl ? `source: ${sourceUrl}` : null,
      template ? `template: ${template}` : null,
      `date: ${new Date().toISOString()}`,
      '---',
      '',
    ].filter((line): line is string => line !== null);

    const frontmatter = frontmatterLines.join('\n');

    const fullContent = frontmatter + content.trim() + '\n';

    fs.writeFileSync(path.join(PENDING_DIR, filename), fullContent, 'utf-8');

    res.json(success({
      filename,
      message: '保存成功',
    }));
  } catch (error) {
    console.error('Error saving pending note:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to save note'));
  }
});

router.delete('/pending-notes/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const safeName = safeFilename(filename);
    const filePath = path.join(PENDING_DIR, safeName);

    if (!fs.existsSync(filePath) || !safeName.endsWith('.md')) {
      return res.status(404).json(apiError(ErrorCode.NOT_FOUND, 'Note not found'));
    }

    fs.unlinkSync(filePath);
    res.json(success({ message: '删除成功' }));
  } catch (error) {
    console.error('Error deleting pending note:', error);
    res.status(500).json(apiError(ErrorCode.INTERNAL_ERROR, 'Failed to delete note'));
  }
});

export default router;
